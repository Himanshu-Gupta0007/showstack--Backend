import { Inngest } from "inngest";
import User from "../models/user.js";
import connectDB from "../config/db.js"; // 👈 MongoDB connect import

// Inngest client
export const inngest = new Inngest({ id: "my-app" });

/* ================================
   Clerk → User Created
================================ */
const clerkUserCreated = inngest.createFunction(
  { id: "clerk-user-created" },
  { event: "clerk/user.created" },

  async ({ event }) => {
    await connectDB(); // ✅ MongoDB connect

    const user = event.data;

    const existingUser = await User.findOne({ clerkId: user.id });
    if (existingUser) return { message: "User already exists" };

    await User.create({
      clerkId: user.id,
      email: user.email_addresses[0]?.email_address,
      firstName: user.first_name,
      lastName: user.last_name,
      image: user.image_url,
    });

    return { message: "User saved to DB" };
  }
);

/* ================================
   Clerk → User Updated
================================ */
const clerkUserUpdated = inngest.createFunction(
  { id: "clerk-user-updated" },
  { event: "clerk/user.updated" },

  async ({ event }) => {
    await connectDB(); // ✅ MongoDB connect

    const user = event.data;

    await User.findOneAndUpdate(
      { clerkId: user.id },
      {
        email: user.email_addresses[0]?.email_address,
        firstName: user.first_name,
        lastName: user.last_name,
        image: user.image_url,
      },
      { new: true }
    );

    return { message: "User updated in DB" };
  }
);

/* ================================
   Clerk → User Deleted
================================ */
const clerkUserDeleted = inngest.createFunction(
  { id: "clerk-user-deleted" },
  { event: "clerk/user.deleted" },

  async ({ event }) => {
    await connectDB(); // ✅ MongoDB connect

    const user = event.data;

    await User.findOneAndDelete({ clerkId: user.id });

    return { message: "User deleted from DB" };
  }
);

// Export all Inngest functions
export const functions = [
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,
];
