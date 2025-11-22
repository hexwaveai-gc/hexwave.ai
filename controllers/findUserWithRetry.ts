"use server"

import User from "@/app/models/User/user.model";
import { dbConnect } from "@/lib/db";

export async function findUserWithRetry(identifierId: string, maxRetries = 10): Promise<any> {

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {

        await dbConnect();

        let user = await User.findById(identifierId).exec();
      
        if (user) return user;
        
        if (attempt === maxRetries) return null;
        
        console.log(`findUserWithRetry: Attempt ${attempt} failed, retrying`, { 
          attempt, 
          maxRetries,
          identifierId 
        });
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.error(`findUserWithRetry: Attempt ${attempt} error`, error, { 
          attempt,
          maxRetries,
          identifierId 
        });
      }
    }

    return null;
  }