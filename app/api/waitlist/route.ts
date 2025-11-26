import { LoopsClient } from "loops";
import { ApiResponse } from "@/utils/api-response/response";

// Lazy initialization - only create client when API key is available
const getLoopsClient = () => {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new LoopsClient(apiKey);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
        return ApiResponse.badRequest("Email is required", { email: email });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.badRequest("Invalid email address", { email: email });
    }

    // Add contact to Loops waitlist
    try {
      const loops = getLoopsClient();
      if (!loops) {
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

    return ApiResponse.ok({
      message: "Successfully joined waitlist"
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return ApiResponse.serverError("Internal server error");
  }
}

