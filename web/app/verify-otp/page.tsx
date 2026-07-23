"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useVerifyOtp } from "@/hooks/auth";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const verifyOtpHook = useVerifyOtp();
  const email = sessionStorage.getItem("verification_email");
  
  const submitHandler = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    
    const otp_token = sessionStorage.getItem("otp_token");
    if (!otp_token) {
        toast.error("No OTP token found. Please register or login again.");
        router.push("/register");
        return;
    }
    
    verifyOtpHook.mutate({ otp, otp_token });
  }

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center py-4 lg:py-20">
      <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
        <div className="space-y-2 text-center">
          <h2 className="font-bold text-3xl">Verify your email</h2>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to your email. Enter it below to verify your account.
          </p>
        </div>

        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-muted-foreground text-sm">
            opt is sent on {email}
          </p>
        <Button 
          className="w-full" 
          onClick={submitHandler} 
          disabled={otp.length !== 6 || verifyOtpHook.isPending}
        >
          {verifyOtpHook.isPending ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </section>
  );
}
