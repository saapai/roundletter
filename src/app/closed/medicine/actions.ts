"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PASSWORD = "medicine";
const COOKIE = "aureliex-medicine";

export async function verifyMedicinePassword(formData: FormData) {
  const pw = (formData.get("password") ?? "").toString().trim().toLowerCase();
  if (pw === PASSWORD) {
    cookies().set(COOKIE, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/closed/medicine");
  }
  redirect("/closed/medicine?err=1");
}

export async function logoutMedicine() {
  cookies().delete(COOKIE);
  redirect("/closed/medicine");
}
