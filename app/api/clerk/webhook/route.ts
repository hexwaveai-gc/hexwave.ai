import User from "@/app/models/User/user.model";
import { dbConnect } from "@/lib/db";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { LoopsClient } from "loops";
import { findUserWithRetry } from "@/controllers/findUserWithRetry";
import { retryOperation } from "@/utils/retry-operation";

const loops = new LoopsClient(process.env.LOOPS_API_KEY as string);
const webhookSecret = process.env.CLERK_USER_WEBHOOK_SECRET || ``;
const MAX_RETRIES = 3;
export const maxDuration = 800;

export const POST = (async (request: Request) => {
  try {
    try {
      const payload = await validateRequest(request);
      await dbConnect();

      switch (payload.type) {
        case "user.created":
          await handleUserCreation(payload);
          break;
        case "user.updated":
          await handleUserUpdate(payload);
          break;
        case "user.deleted":
          await handleUserDeletion(payload);
          break;
      }

      return Response.json({ message: "Success" });
    } finally {
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return Response.json(
        {
          error: "Request timeout",
          details: "Operation took too long to complete",
        },
        { status: 408 }
      );
    }

    if (error.code === "UND_ERR_CONNECT_TIMEOUT") {
      return Response.json(
        {
          error: "Connection timeout",
          details: "Failed to connect to the database",
        },
        { status: 504 }
      );
    }

    console.error("[POST /api/users/clerk] Webhook error", error);
    return Response.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});

async function handleUserCreation(payload: WebhookEvent) {
  const userData = getUserDataFromEvent(payload);

  try {
    // Check if user already exists with timeout
    const existingUser = await findUserWithRetry(userData._id);

    if (existingUser) {
      console.log(
        "[POST /api/users/clerk] User already exists, skipping creation",
        { userId: userData._id }
      );
      return;
    }

    // Create new user
    const user = await User.create([userData]);
    // const mailingLists = {
    //   cm88e9w7x01uh0ll1eqpycrh6: true,
    //   cm88e2nq1002c0llbfv5rbb04: true,
    // };
   /* TODO: Will add loops lateron.  */
    // Update contact in Loops
    // try {
    //   await retryOperation(async () => {
    //     await loops.updateContact(userData.email as string, mailingLists);
    //   });
    // } catch (error) {
    //   console.error("[POST /api/users/clerk] Loops update failed", error);
    // }

    return user;
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("[POST /api/users/clerk] Duplicate user creation attempted", {
        userId: userData._id,
      });
      return;
    }
    console.error("[POST /api/users/clerk] Error in User Creation", error);
  }
}

async function handleUserUpdate(payload: WebhookEvent) {
  const userData = getUserDataFromEvent(payload);
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const user = await User.findByIdAndUpdate(userData._id, userData, {
        new: true,
        runValidators: true,
      }).maxTimeMS(100000);

      if (!user) {
        console.log("[POST /api/users/clerk] User not found for update", {
          userId: userData._id,
        });
        return await User.create([userData]);
      }

      return user;
    } catch (error: any) {
      if (retries === MAX_RETRIES - 1) throw error;
      retries++;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 5000))
      );
    }
  }
}

async function handleUserDeletion(payload: WebhookEvent) {
  try {
    const user = await User.findByIdAndDelete(payload.data.id)
      .maxTimeMS(100000)
      .exec();

    if (!user) {
      console.log("[POST /api/users/clerk] User not found for deletion", {
        userId: payload.data.id,
      });
    }
    return user;
  } catch (error) {
    console.error("[POST /api/users/clerk] Error deleting user", error, {
      userId: payload.data.id,
    });
  }
}

async function validateRequest(request: Request) {
  try {
    const payloadString = await request.text();
    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    // Validate required headers
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new Error("Missing required Svix headers");
    }

    if (!webhookSecret) {
      throw new Error("Webhook secret is not configured");
    }

    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    };

    const wh = new Webhook(webhookSecret);
    return wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("[POST /api/users/clerk] Webhook validation failed", error);
    throw error;
  }
}

function getUserDataFromEvent(evt: any) {
  const primaryEmailAddressId = evt.data.primary_email_address_id;
  const validEmailAddresses = evt.data.email_addresses.filter(
    (email: any) => email.id === primaryEmailAddressId
  );

  return {
    _id: evt.data.id,
    name: evt.data.first_name
      ? `${evt.data.first_name} ${evt.data.last_name || ""}`
      : evt.data.username || "Unknown",
    email: validEmailAddresses[0]?.email_address,
  };
}