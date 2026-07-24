"use client";

import { ProfileLoader } from "@/components/Animated-Loader";
import { useProfile } from "@/hooks/Profile";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, error } = useProfile();

  useEffect(() => {
    if (!isLoading) {
      if (isError) {
        // If we have an error, check the HTTP status
        const status = (error as any)?.response?.status;
        
        if (status === 401) {
          console.log("Redirecting to login: 401 Unauthorized");
          router.push("/login");
        } else if (status === 404) {
          // 404 means the user is authenticated but has no profile yet
          if (pathname !== "/onboarding") {
            console.log("Redirecting to onboarding: Profile not found");
            router.push("/onboarding");
          }
        } else {
          // Fallback for other errors (e.g. network failure)
          console.log("Redirecting to login: Unknown error", error);
          router.push("/login");
        }
      } else if (user) {
        // User has a profile
        if (pathname === "/onboarding") {
          console.log("User already has a profile, redirecting to dashboard");
          router.push("/dashboard");
        }
      }
    }
  }, [isLoading, isError, error, user, pathname, router]);

  // Determine what to render based on state
  if (isLoading) {
    return <ProfileLoader />;
  }

  // If no profile (404), only allow rendering the onboarding page
  if (isError && (error as any)?.response?.status === 404 && pathname === "/onboarding") {
    return <>{children}</>;
  }

  // If user has a profile, allow rendering anything EXCEPT onboarding (which redirects)
  if (user && pathname !== "/onboarding") {
    return <>{children}</>;
  }

  // Fallback loader while redirects are happening
  return <ProfileLoader />;
}