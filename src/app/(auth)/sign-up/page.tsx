'use client';

import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { UrlProvider } from "@/components/url-provider";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering because we use useSearchParams
export const dynamic = 'force-dynamic';

export default function Signup() {
  const searchParamsRaw = useSearchParams();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const messageParam = searchParamsRaw.get('message');
    const descriptionParam = searchParamsRaw.get('description');
    const errorParam = searchParamsRaw.get('error');
    const codeParam = searchParamsRaw.get('code');

    let newMessage: Message | null = null;

    if (errorParam) {
      newMessage = { error: descriptionParam || errorParam };
    } else if (messageParam) {
      newMessage = { success: descriptionParam || messageParam };
    } else if (codeParam === 'EMAIL_CONFIRMATION_REQUIRED') {
      newMessage = { message: 'Check your email to confirm sign up.' };
    }

    setMessage(newMessage);
  }, [searchParamsRaw]);

  if (message && ("success" in message || "message" in message)) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen w-full flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
            <h1 className="text-2xl font-semibold mb-4">Check your inbox</h1>
            <FormMessage message={message} />
            <Link href="/sign-in" className="text-primary text-sm hover:underline mt-4 inline-block">Return to Sign In</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <UrlProvider>
            <form className="flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    className="text-primary font-medium hover:underline transition-all"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    minLength={6}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Signing up..."
                className="w-full"
              >
                Sign up
              </SubmitButton>

              {message && <FormMessage message={message} />}
            </form>
          </UrlProvider>
        </div>
        <SmtpMessage />
      </div>
    </>
  );
}
