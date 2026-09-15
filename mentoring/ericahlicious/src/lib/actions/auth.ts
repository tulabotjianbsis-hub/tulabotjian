"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "An error occurred during login" };
  }
}

export async function logout() {
  await signOut({ redirect: true, redirectTo: "/login" });
}
