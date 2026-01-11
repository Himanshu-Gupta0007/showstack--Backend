import { getAuth } from "@clerk/express";

export const protectAdmin = (req, res, next) => {
  try {
    const auth = getAuth(req);

    // 🔒 Not logged in
    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (login required)",
      });
    }

    // 🔑 Role from Clerk metadata
    const role = auth.sessionClaims?.publicMetadata?.role;

    // 🚫 Not admin
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // ✅ Attach user to request
    req.user = {
      id: auth.userId,
      sessionId: auth.sessionId,
      role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Clerk authentication failed",
    });
  }
};
