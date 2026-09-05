import { redirect } from "next/navigation";

export default function HomePage() {
  // Root redirects to the role selection page in the admin app
  redirect("/select-role");
}
