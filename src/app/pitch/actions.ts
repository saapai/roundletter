"use server";
import { redirect } from "next/navigation";
import { signToken } from "./token";

const PASSWORD = "quinnanish";

export async function verifyPitchPassword(formData: FormData) {
  const pw = (formData.get("password") ?? "").toString().trim().toLowerCase();
  if (pw === PASSWORD) {
    redirect(`/pitch?k=${encodeURIComponent(signToken())}`);
  }
  redirect("/pitch?err=1");
}

export async function logoutPitch() {
  redirect("/pitch");
}
