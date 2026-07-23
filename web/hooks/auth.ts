import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./utils";
import { useRouter } from "next/navigation";

export interface createAcc {
  username: string;
  email: string;
  password: string;
}

type RegisterLoginRespose = {
  otp_token: string;
};
const useCreateAcc = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: createAcc) => {
      const response = await api.post("/auth/signup", data);
      return response.data as RegisterLoginRespose;
    },
    onSuccess: (data) => {
      sessionStorage.setItem("otp_token", data.otp_token);
      router.push("/verify-otp");
      toast.success("Account created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create account";
      toast.error(message);
    },
  });
};


export interface VerifyOtpData {
  otp: string;
  otp_token: string;
}

const useVerifyOtp = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      const response = await api.post("/auth/verify-otp", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Account verified successfully");
      router.push("/onboarding"); // or /onboarding depending on flow
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to verify OTP";
      toast.error(message);
    },
  });
};

export { useCreateAcc, useVerifyOtp };
