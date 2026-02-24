"use server";

import { getDb } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("email:", email, ", password:", password);

  if (email == null) {
    throw new Error("Email missing");
  }

  const emailStr = email.toString();

  if (emailStr === "") {
    throw new Error("Invalid email");
  }

  if (password == null) {
    throw new Error("Password missing");
  }

  const passwordStr = password.toString();

  if (passwordStr === "") {
    throw new Error("Invalid password");
  }

  const db = getDb();

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", emailStr)
    .where("password", "=", passwordStr)
    .executeTakeFirstOrThrow();

  const cookieStore = await cookies();

  cookieStore.set("session", user.id.toString());

  redirect("/");
}
