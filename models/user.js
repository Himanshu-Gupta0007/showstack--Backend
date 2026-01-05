import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    firstName: String,
    lastName: String,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
