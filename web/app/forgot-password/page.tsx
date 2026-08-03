"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const forgotPasswordHook = useForgotPassword();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) return;

    try {
      await forgotPasswordHook.mutateAsync({
        email,
        new_password: newPassword,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center py-4 lg:py-20">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="font-bold text-3xl">Reset Password</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email and a new password to reset it.
          </p>
        </div>
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={forgotPasswordHook.isPending}
          >
            {forgotPasswordHook.isPending ? "Sending code..." : "Reset Password"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}
