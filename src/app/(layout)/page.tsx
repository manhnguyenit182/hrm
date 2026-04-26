import Dashboard from "@/components/Dashboard";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrganizationChart } from "@/components/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Verify authentication in server component
  const { isValid, user } = await verifyAuth();

  // If not authenticated, redirect to login
  if (!isValid || !user) {
    redirect("/login");
  }

  const initialData = await getOrganizationChart();

  return <Dashboard initialData={initialData} />;
}
