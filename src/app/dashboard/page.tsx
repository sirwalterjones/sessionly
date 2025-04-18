'use client';

import { InfoIcon, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/client";
import { useEffect, useState } from 'react';
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { NewSessionForm } from "../../components/new-session-form";
import { Session } from '@supabase/supabase-js';

// Assume SessionDbType represents the structure returned by getSessionsByUser
// Replace with actual structure if known, or import from types if available
// This is a placeholder based on common patterns seen earlier
type SessionDbType = {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    duration: number;
    price: number;
    deposit?: number | null;
    deposit_required?: boolean;
    location_name?: string | null;
    address?: string | null;
    location_notes?: string | null;
    created_at: string;
    updated_at?: string;
    // Add any other fields returned by getSessionsByUser select('*')
};

export default function Dashboard() {
  const supabase = createClient();
  const [userSession, setUserSession] = useState<Session | null>(null);
  // Explicitly type the state with the expected Session structure array
  const [sessions, setSessions] = useState<SessionDbType[]>([]);
  const [loading, setLoading] = useState(true);
  // State to control drawer open/close
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError || !authData.session) {
        console.error('Auth error or no session:', authError);
        redirect("/sign-in");
        return;
      }

      setUserSession(authData.session);

      try {
        const { data, error } = await getSessionsByUser();
        if (error) {
          console.error('Error fetching sessions:', error);
        } else {
          // Ensure data is not null before setting state
          setSessions(data || []);
        }
      } catch (err) {
        console.error('Exception fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchData();
  }, [supabase]);

  if (loading || !userSession) {
    return <div>Loading...</div>;
  }

  // Function to close the drawer, passed to the form
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <DashboardLayout user={userSession.user}>
      {/* Use Drawer component root */}
      <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your photography sessions.
            </p>
          </div>
          {/* Use DrawerTrigger to open the drawer */}
          <DrawerTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Session
            </Button>
          </DrawerTrigger>
        </header>

        <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center mt-4">
          <InfoIcon size="14" />
          <span>Welcome back! Manage your sessions efficiently.</span>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              {sessions && sessions.length > 0
                ? `You have ${sessions.length} active session${sessions.length > 1 ? "s" : ""}.`
                : "You haven't created any sessions yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your sessions will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">Ready to start booking?</p>
                {/* Use DrawerTrigger here as well if this button should also open it */}
                <DrawerTrigger asChild>
                   <Button>
                       <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Session
                   </Button>
                </DrawerTrigger>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drawer Content slides in from the right */}
        <DrawerContent className="fixed inset-y-0 right-0 z-50 flex h-full w-1/2 flex-col rounded-l-lg border bg-background">
          {/* Remove intermediate div, apply padding directly */} 
          {/* <div className="w-full p-6 overflow-auto h-full"> */}
            <DrawerHeader className="p-6 pb-4 text-left"> {/* Add padding to header */} 
              <DrawerTitle>Create New Session</DrawerTitle>
              <DrawerDescription>Fill in the details for your new session.</DrawerDescription>
            </DrawerHeader>
            {/* Wrapper for form content, handles flex grow and scrolling */} 
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
              {/* Pass closeDrawer instead of closeDialog */}
              <NewSessionForm closeDialog={closeDrawer} />
            </div>
            {/* Removed DrawerFooter as form has its own submit/cancel */}
          {/* </div> */}
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
}
