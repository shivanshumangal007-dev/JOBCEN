"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { DynamicUpdateForm } from "@/components/forms/DynamicUpdateForm";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManualOnboardingPage() {
  const router = useRouter();
  const updateProfile = useStore((state) => state.updateProfile);
  const setHasProfile = useStore((state) => state.setHasProfile);

  const handleSubmit = (data: any) => {
    updateProfile({
      full_name: data.name,
      bio: data.bio || "",
      contact: {
        address: data.location || ""
      }
    } as any);
    setHasProfile(true);
    router.push("/dashboard");
  };

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-3xl mx-auto w-full p-8">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-heading font-medium text-primary">Basic Info</h1>
        <p className="text-muted-foreground font-light text-lg">
          Let's start with your core details. You can add experience and education later from the Edit Portal.
        </p>
      </div>

      <DynamicUpdateForm type="Basic Info" onSubmit={handleSubmit} />
    </PageTransition>
  );
}
