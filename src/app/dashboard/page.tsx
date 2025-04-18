import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";
import { getSessionsByUser } from "../actions/sessions";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: sessions, error } = await getSessionsByUser();

  return (
    <DashboardLayout user={user}>
      {/* Header Section */}
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
          <InfoIcon size="14" />
          <span>Welcome to your photography session management dashboard</span>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            {sessions && sessions.length > 0
              ? `You have ${sessions.length} session${sessions.length > 1 ? "s" : ""}`
              : "You haven't created any sessions yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {/* Session list would go here */}
              <p className="text-sm text-muted-foreground">
                Your sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/sessions/new")
                }
              >
                Create New Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
