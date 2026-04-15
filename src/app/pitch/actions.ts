"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PASSWORD = "quinnanish";
const COOKIE = "aureliex-pitch";

export async function verifyPitchPassword(formData: FormData) {
  const pw = (formData.get("password") ?? "").toString().trim().toLowerCase();
  if (pw === PASSWORD) {
    cookies().set(COOKIE, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    redirect("/pitch");
  } else {
    redirect("/pitch?err=1");
  }
}

export async function logoutPitch() {
  cookies().delete(COOKIE);
  redirect("/pitch");
}
