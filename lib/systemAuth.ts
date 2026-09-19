import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Mirrors lib/auth.ts exactly, but under its own cookie name/secret — a
// fully separate session namespace from the /admin login (see the schema
// comment on SystemUser for why).
const COOKIE_NAME = "sakkab_system_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.SYSTEM_SESSION_SECRET;
  if (!secret) {
    throw new Error("SYSTEM_SESSION_SECRET is not set in the environment");
  }
  return new TextEncoder().encode(secret);
}

export async function createSystemSession(userId: string, email: string, role: string) {
  const token = await new SignJWT({ sub: userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function getSystemSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { sub: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function clearSystemSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
