import User from "../models/user.js";

export const syncUser = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔹 Ye line sabse important – Clerk se full user details fetch karo
    const clerkUser = await clerkClient.users.getUser(userId);

    // Ab yaha se sab mil jaayega
    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    const firstName = clerkUser.firstName || "";
    const lastName = clerkUser.lastName || "";
    const image = clerkUser.imageUrl || "";

    // MongoDB mein user dhundho ya create karo
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        email,
        firstName,
        name: `${firstName} ${lastName}`.trim(), // agar name field hai to
        image,
        // aur jo bhi fields tune model mein daale hain
      });
    } else {
      // Agar user already hai to update bhi kar sakte ho (optional)
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.image = image;
      await user.save();
    }

    res.status(200).json({
      message: "User synced successfully with MongoDB! 🎉",
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.image,
      },
    });
  } catch (error) {
    console.error("SYNC ERROR:", error);
    res.status(500).json({ message: "Sync failed", error: error.message });
  }
};