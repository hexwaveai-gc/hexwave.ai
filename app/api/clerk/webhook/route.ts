import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import User from '@/app/models/User/user.model'
import UserProfile from '@/app/models/UserProfile/user-profile.model'
import { logInfo, logError, logWarn, createTimer } from '@/lib/logger'

// Disable body parsing, we need the raw body for Svix signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Production-grade Clerk webhook handler
 * Handles user.created, user.updated, and user.deleted events
 * Stores user data in MongoDB using the User model
 */
export async function POST(req: Request) {
  const timer = createTimer('clerk_webhook')

  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // Validate headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    logWarn('Clerk webhook missing Svix headers', { svixId: !!svixId })
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
    logError('Clerk webhook secret not configured')
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
    logError('Clerk webhook verification failed', err)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 400 }
    )
  }

  // Handle the webhook event
  const eventType = evt.type
  const eventId = evt.data.id

  logInfo('Clerk webhook received', { eventType, eventId })

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
        logWarn('Unhandled Clerk webhook event', { eventType })
    }

    const duration = timer.done({ eventType, eventId })
    logInfo('Clerk webhook processed', { eventType, eventId, duration })

    return NextResponse.json({ 
      success: true, 
      message: `Event ${eventType} processed successfully` 
    })
  } catch (error) {
    timer.done({ error: true })
    logError('Clerk webhook processing error', error, { eventType, eventId })
    
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
 * Creates a new user in the database and initializes their profile
 */
async function handleUserCreated(data: any) {
  const userId = data.id
  const emailAddresses = data.email_addresses || []
  const primaryEmail = emailAddresses.find((email: any) => email.id === data.primary_email_address_id)
  const email = primaryEmail?.email_address || emailAddresses[0]?.email_address || ''
  
  // Get user's name from various sources
  const firstName = data.first_name || ''
  const lastName = data.last_name || ''
  const clerkUsername = data.username || ''
  const imageUrl = data.image_url || null
  const name = 
    (firstName && lastName) ? `${firstName} ${lastName}` :
    firstName || lastName || clerkUsername || email.split('@')[0] || 'User'

  // Validate required fields
  if (!email) {
    logError('Clerk webhook user.created missing email', null, { userId })
    throw new Error('Email address is required but not found')
  }

  // Check if user already exists (idempotency)
  const existingUser = await User.findById(userId)
  if (existingUser) {
    logInfo('Clerk webhook user already exists, skipping creation', { userId })
    // Still try to create profile if missing
    await createOrUpdateUserProfile(userId, {
      email,
      firstName,
      lastName,
      username: clerkUsername,
      imageUrl,
      displayName: name,
    })
    return
  }

  // Create new user
  const newUser = new User({
    _id: userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    customerId: null,
    subscription: null,
    credits: 0,
    favorites: [],
  })

  await newUser.save()
  logInfo('Clerk webhook user created', { userId, email })

  // Create user profile
  await createOrUpdateUserProfile(userId, {
    email,
    firstName,
    lastName,
    username: clerkUsername,
    imageUrl,
    displayName: name,
  })
}

/**
 * Handle user.updated event
 * Updates existing user in the database and their profile
 */
async function handleUserUpdated(data: any) {
  const userId = data.id
  const emailAddresses = data.email_addresses || []
  const primaryEmail = emailAddresses.find((email: any) => email.id === data.primary_email_address_id)
  const email = primaryEmail?.email_address || emailAddresses[0]?.email_address || ''
  
  // Get user's name from various sources
  const firstName = data.first_name || ''
  const lastName = data.last_name || ''
  const clerkUsername = data.username || ''
  const imageUrl = data.image_url || null
  const name = 
    (firstName && lastName) ? `${firstName} ${lastName}` :
    firstName || lastName || clerkUsername || email.split('@')[0] || 'User'

  // Find existing user
  const user = await User.findById(userId)
  if (!user) {
    logInfo('Clerk webhook user.updated - user not found, creating', { userId })
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
    logInfo('Clerk webhook user updated', { userId, updatedFields: Object.keys(updateData) })
  }

  // Update user profile
  await createOrUpdateUserProfile(userId, {
    email,
    firstName,
    lastName,
    username: clerkUsername,
    imageUrl,
    displayName: name,
  })
}

/**
 * Handle user.deleted event
 * Soft delete or remove user from database
 */
async function handleUserDeleted(data: any) {
  const userId = data.id

  // Find and delete user
  const user = await User.findByIdAndDelete(userId)
  
  if (user) {
    logInfo('Clerk webhook user deleted', { userId })
  } else {
    logWarn('Clerk webhook user.deleted - user not found', { userId })
  }

  // Also delete user profile
  const profile = await UserProfile.findOneAndDelete({ user_id: userId })
  if (profile) {
    logInfo('Clerk webhook user profile deleted', { userId })
  }
}

/**
 * Create or update user profile
 * Called when user is created or updated via Clerk webhook
 */
interface ProfileData {
  email: string
  firstName?: string
  lastName?: string
  username?: string
  imageUrl?: string | null
  displayName?: string
}

async function createOrUpdateUserProfile(userId: string, data: ProfileData) {
  try {
    // Check if profile exists
    const existingProfile = await UserProfile.findOne({ user_id: userId })
    
    if (existingProfile) {
      // Update email and avatar if changed from Clerk
      const updateData: Record<string, unknown> = {}
      
      if (data.email && data.email.toLowerCase() !== existingProfile.email) {
        updateData.email = data.email.toLowerCase()
      }
      
      // Only update avatar if user hasn't set a custom one
      if (data.imageUrl && !existingProfile.avatar_url) {
        updateData.avatar_url = data.imageUrl
      }
      
      if (Object.keys(updateData).length > 0) {
        await UserProfile.findOneAndUpdate(
          { user_id: userId },
          { $set: updateData }
        )
        logInfo('Clerk webhook profile updated', { userId, updatedFields: Object.keys(updateData) })
      }
      return
    }

    // Create new profile
    const baseUsername = generateUsername(
      data.firstName,
      data.lastName,
      data.username,
      data.email
    )
    const uniqueUsername = await ensureUniqueUsername(baseUsername)

    const newProfile = new UserProfile({
      user_id: userId,
      username: uniqueUsername,
      display_name: data.displayName || uniqueUsername,
      email: data.email.toLowerCase(),
      avatar_url: data.imageUrl || null,
      bio: "",
      social_links: {},
      stats: { likes: 0, posts: 0, views: 0, followers: 0, following: 0 },
      is_public: true,
      is_verified: false,
      preferences: {
        show_stats: true,
        allow_messages: true,
        email_notifications: true,
      },
    })

    await newProfile.save()
    logInfo('Clerk webhook profile created', { userId, username: uniqueUsername })

  } catch (error) {
    logError('Clerk webhook profile creation error', error, { userId })
    // Don't throw - profile creation is not critical
  }
}

/**
 * Generate a username from user data
 */
function generateUsername(
  firstName?: string,
  lastName?: string,
  existingUsername?: string,
  email?: string
): string {
  // Try existing username first
  if (existingUsername) {
    return existingUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30)
  }

  // Try first + last name
  if (firstName && lastName) {
    return `${firstName}_${lastName}`.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30)
  }

  // Try first name only
  if (firstName) {
    return firstName.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30)
  }

  // Try email prefix
  if (email) {
    return email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30)
  }

  // Random fallback
  return `user_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Ensure username is unique by appending random suffix if needed
 */
async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername
  let attempts = 0
  const maxAttempts = 10

  // Add random adjective/noun to make username more interesting
  const adjectives = ['creative', 'cosmic', 'digital', 'stellar', 'pixel', 'neon', 'cyber', 'astro']
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]

  // First try with adjective prefix
  username = `${randomAdj}_${baseUsername}`.slice(0, 30)

  while (attempts < maxAttempts) {
    const existing = await UserProfile.findOne({ username })
    if (!existing) {
      return username
    }

    // Add random suffix
    const suffix = Math.random().toString(36).slice(2, 6)
    username = `${baseUsername.slice(0, 25)}_${suffix}`
    attempts++
  }

  // Final fallback with timestamp
  return `${baseUsername.slice(0, 20)}_${Date.now().toString(36)}`
}
