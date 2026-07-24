import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./utils";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"

export interface createAcc {
  username: string;
  email: string;
  password: string;
}

type RegisterLoginRespose = {
  otp_token: string;
};

function extractErrorMessage(error: any): string {
  const detail = error.response?.data?.detail;

  if (!detail) return "Something went wrong";
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail[0]?.msg || "Validation failed";
  }

  return "Something went wrong";
}
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
      // const message =
      //   error.response?.data?.detail || "Failed to create account";
      const message = extractErrorMessage(error)
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
      Cookies.set("access_token", data.access_token, {
        expires: 7,          // days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      toast.success("Account verified successfully");
      router.push("/onboarding"); // or /onboarding depending on flow
    },
    onError: (error: any) => {
      // const message =
      //   error.response?.data?.detail || "Failed to verify OTP";
      const message = extractErrorMessage(error)
      toast.error(message);
    },
  });
};

export interface LoginData {
  email?: string;
  username?: string;
  password: string;
  remember_me?: boolean
}

const useLoginUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: LoginData) => {
      console.log(data)
      const response = await api.post("/auth/login", data);
      return response.data as RegisterLoginRespose;
    },
    onSuccess: (data) => {
      sessionStorage.setItem("otp_token", data.otp_token);
      router.push("/verify-otp");
      toast.success("Please verify your OTP to login");
    },
    onError: (error: any) => {
      // const message =
      //   error.response?.data?.detail || "Failed to login";
      const message = extractErrorMessage(error);
      toast.error(message);
    },
  });
};

export { useCreateAcc, useVerifyOtp, useLoginUser };
