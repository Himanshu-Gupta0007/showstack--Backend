import { getAuth } from "@clerk/express";

const ADMIN_EMAILS = ["guptahimu90@gmail.com"]; // 👈 apna email

export const protectAdmin = (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (login required)",
      });
    }

    const email =
      auth.sessionClaims?.email ||
      auth.sessionClaims?.primary_email_address;

    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    req.user = {
      id: auth.userId,
      email,
      sessionId: auth.sessionId,
      role: "admin",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Clerk authentication failed",
    });
  }
};
