import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "sakkab_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set in the environment");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(adminId: string, username: string, role: string) {
  const token = await new SignJWT({ sub: adminId, username, role })
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

export async function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { sub: string; username: string; role: string };
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
