import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import User from '@/app/models/User/user.model'

// Disable body parsing, we need the raw body for Svix signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Production-grade Clerk webhook handler
 * Handles user.created, user.updated, and user.deleted events
 * Stores user data in MongoDB using the User model
 */
export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // Validate headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('[Webhook] Missing Svix headers')
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the raw body for signature verification
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Verify webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] CLERK_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the payload
  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('[Webhook] Verification failed:', err)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 400 }
    )
  }

  // Handle the webhook event
  const eventType = evt.type
  const eventId = evt.data.id

  console.log(`[Webhook] Processing event: ${eventType} for user: ${eventId}`)

  try {
    // Connect to database
    await dbConnect()

    switch (eventType) {
      case 'user.created': {
        await handleUserCreated(evt.data)
        break
      }
      case 'user.updated': {
        await handleUserUpdated(evt.data)
        break
      }
      case 'user.deleted': {
        await handleUserDeleted(evt.data)
        break
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Event ${eventType} processed successfully` 
    })
  } catch (error) {
    console.error(`[Webhook] Error processing ${eventType}:`, error)
    
    // Return 500 to trigger Clerk's retry mechanism
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle user.created event
 * Creates a new user in the database
 */
async function handleUserCreated(data: any) {
  try {
    const userId = data.id
    const emailAddresses = data.email_addresses || []
    const primaryEmail = emailAddresses.find((email: any) => email.id === data.primary_email_address_id)
    const email = primaryEmail?.email_address || emailAddresses[0]?.email_address || ''
    
    // Get user's name from various sources
    const firstName = data.first_name || ''
    const lastName = data.last_name || ''
    const username = data.username || ''
    const name = 
      (firstName && lastName) ? `${firstName} ${lastName}` :
      firstName || lastName || username || email.split('@')[0] || 'User'

    // Validate required fields
    if (!email) {
      throw new Error('Email address is required but not found')
    }

    // Check if user already exists (idempotency)
    const existingUser = await User.findById(userId)
    if (existingUser) {
      console.log(`[Webhook] User ${userId} already exists, skipping creation`)
      return
    }

    // Create new user
    const newUser = new User({
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      customerId: null,
      subscription: null,
      availableBalance: 0,
      favorites: [],
    })

    await newUser.save()
    console.log(`[Webhook] User created successfully: ${userId} (${email})`)
  } catch (error) {
    console.error('[Webhook] Error creating user:', error)
    throw error
  }
}

/**
 * Handle user.updated event
 * Updates existing user in the database
 */
async function handleUserUpdated(data: any) {
  try {
    const userId = data.id
    const emailAddresses = data.email_addresses || []
    const primaryEmail = emailAddresses.find((email: any) => email.id === data.primary_email_address_id)
    const email = primaryEmail?.email_address || emailAddresses[0]?.email_address || ''
    
    // Get user's name from various sources
    const firstName = data.first_name || ''
    const lastName = data.last_name || ''
    const username = data.username || ''
    const name = 
      (firstName && lastName) ? `${firstName} ${lastName}` :
      firstName || lastName || username || email.split('@')[0] || 'User'

    // Find existing user
    const user = await User.findById(userId)
    if (!user) {
      console.log(`[Webhook] User ${userId} not found, creating new user`)
      // If user doesn't exist, create them (handles edge cases)
      await handleUserCreated(data)
      return
    }

    // Update user fields
    const updateData: Partial<{
      name: string
      email: string
    }> = {}

    if (name.trim() && name.trim() !== user.name) {
      updateData.name = name.trim()
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      updateData.email = email.toLowerCase().trim()
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(userId, updateData, { new: true })
      console.log(`[Webhook] User updated successfully: ${userId}`)
    } else {
      console.log(`[Webhook] No changes detected for user: ${userId}`)
    }
  } catch (error) {
    console.error('[Webhook] Error updating user:', error)
    throw error
  }
}

/**
 * Handle user.deleted event
 * Soft delete or remove user from database
 */
async function handleUserDeleted(data: any) {
  try {
    const userId = data.id

    // Find and delete user
    const user = await User.findByIdAndDelete(userId)
    
    if (user) {
      console.log(`[Webhook] User deleted successfully: ${userId}`)
    } else {
      console.log(`[Webhook] User ${userId} not found for deletion`)
    }
  } catch (error) {
    console.error('[Webhook] Error deleting user:', error)
    throw error
  }
}

