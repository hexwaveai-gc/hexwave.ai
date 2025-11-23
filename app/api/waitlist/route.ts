import { NextResponse } from "next/server";
import { LoopsClient } from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Add contact to Loops waitlist
    try {
      if (!process.env.LOOPS_API_KEY) {
        console.warn("LOOPS_API_KEY not configured, skipping Loops integration");
      } else {
        // Create or update contact in Loops
        // Loops API expects email and optional properties
        await loops.createContact({
          email: email,
          properties: {
            firstName: name || undefined,
            source: "waitlist",
          },
        });

        // Optionally, add to a specific list if you have one
        // await loops.updateContact(email, {
        //   listIds: ["your-waitlist-list-id"],
        // });
      }
    } catch (loopsError: any) {
      // Log error but don't fail the request if Loops fails
      console.error("Loops API error:", loopsError);
      // Continue execution - we still want to return success to the user
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined waitlist",
        email: email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

