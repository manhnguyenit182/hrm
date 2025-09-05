import Dashboard from "@/components/Dashboard";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // Verify authentication in server component
  const { isValid, user } = await verifyAuth();

  // If not authenticated, redirect to login
  if (!isValid || !user) {
    redirect("/login");
  }

  return <Dashboard />;
}
