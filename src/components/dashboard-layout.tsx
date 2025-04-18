"use client";

import { ReactNode } from "react";
import DashboardNavbar from "./dashboard-navbar";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Settings,
  PlusCircle,
  Image,
  UserCircle,
  MapPin,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <>
      <DashboardNavbar />
      <div className="flex min-h-[calc(100vh-65px)] bg-gray-50">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-white p-4 hidden md:block">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                SESSIONS
              </h3>
              <div className="space-y-1">
                <Button
                  variant={
                    isActive("/dashboard/sessions") ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => router.push("/dashboard/sessions")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  All Sessions
                </Button>
                <Button
                  variant={
                    isActive("/dashboard/upcoming") ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => router.push("/dashboard/upcoming")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Upcoming
                </Button>
                <Button
                  variant={
                    isActive("/dashboard/clients") ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => router.push("/dashboard/clients")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                FINANCES
              </h3>
              <div className="space-y-1">
                <Button
                  variant={
                    isActive("/dashboard/payments") ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => router.push("/dashboard/payments")}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payments
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                SETTINGS
              </h3>
              <div className="space-y-1">
                <Button
                  variant={
                    isActive("/dashboard/settings") ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Right Panel */}
        <aside className="w-80 border-l bg-white p-4 hidden lg:block">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                QUICK CREATE
              </h3>
              <Card className="border border-dashed">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <Image className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium mb-1">New Session</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Create a new photography session
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/dashboard/sessions/new")}
                    >
                      Create Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                USER PROFILE
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCircle size={40} className="text-primary" />
                    <div>
                      <h3 className="font-medium">
                        {user?.email?.split("@")[0] || "User"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center gap-1 mb-1">
                      <MapPin size={12} /> No location set
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar size={12} /> Joined{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
