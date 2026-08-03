"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { LoginData, useLoginUser, useGoogleAuth } from "@/hooks/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any | null>(null);
  const loginUserHook = useLoginUser();
  const googleAuthHook = useGoogleAuth();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: LoginData = {
      username: identifier.includes("@") ? undefined : identifier,
      email: identifier.includes("@") ? identifier : undefined,
      password,
      remember_me: (
        document.getElementById("rememberMe") as HTMLInputElement
      )?.checked || false,
    };
    try {
      await loginUserHook.mutateAsync(data);
      if (data.remember_me) {
        localStorage.setItem("verification_email", identifier);
      } else {
        sessionStorage.setItem("verification_email", identifier);
      }
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err);
    }
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center py-4 lg:py-20">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="mt-6 font-bold text-3xl">Sign in to your account</h2>
        {/* {error && (
          <div className="text-red-500">
            {error?.response?.data?.detail || error?.message || "failed to login"}
          </div>
        )} */}
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address or Username</Label>
            <Input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              required
              className="mt-1"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" />
              <label
                htmlFor="rememberMe"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <Link href="/forgot-password" className="text-sm hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginUserHook.isPending}
            >
              {loginUserHook.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="space-y-6 lg:mt-10">
          <div className="w-full max-w-sm">
            <div className="relative flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground shrink-0 text-sm">
                or continue with
              </span>
              <Separator className="flex-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 items-center justify-center flex">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    googleAuthHook.mutate(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
          <span className="text-muted-foreground text-sm mx-auto flex gap-1 justify-center w-full">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary underline underline-offset-4"
            >
              Register from here
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
