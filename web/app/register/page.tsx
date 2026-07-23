"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { createAcc, useCreateAcc } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any | null>(null);
  const createAccHook = useCreateAcc();
  const router = useRouter();

  const submitHandler = async () => {
    const data: createAcc = {
      username,
      email,
      password,
    };
    try {
      await createAccHook.mutateAsync(data);
      console.log("account created successfully");
      sessionStorage.setItem("verification_email", email);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };
  return (
    <section className="flex min-h-screen w-full items-center justify-center py-4 lg:py-20">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="mt-6 font-bold text-3xl">Create an account</h2>
        {error && (
          <div className="text-red-500">
            {error?.response?.data?.detail || error?.message}
          </div>
        )}
        <form action="#" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">User name</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <Link href="#" className="text-sm hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div>
            <Button
              className="w-full"
              disabled={createAccHook.isPending}
              onClick={submitHandler}
            >
              {createAccHook.isPending ? "Creating account..." : "SignUp"}
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

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"></path>
              </svg>
              <span className="sr-only">Google</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
