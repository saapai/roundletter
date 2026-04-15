"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PASSWORD = "polymarket";
const COOKIE = "aureliex-inner";

export async function verifyPassword(formData: FormData) {
  const pw = (formData.get("password") ?? "").toString().trim().toLowerCase();
  if (pw === PASSWORD) {
    cookies().set(COOKIE, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/closed");
  } else {
    redirect("/closed?err=1");
  }
}

export async function logout() {
  cookies().delete(COOKIE);
  redirect("/closed");
}
