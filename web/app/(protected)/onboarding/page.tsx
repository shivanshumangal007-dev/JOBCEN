"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUp, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <PageTransition className="flex-1 flex flex-col items-center justify-center p-8 min-h-[100dvh]">
      <div className="max-w-3xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-primary">
            How would you like to start?
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Choose a starting point to build your master profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-8 cursor-pointer hover:border-primary transition-colors flex flex-col items-center text-center space-y-4 rounded-none bg-card/50"
            onClick={() => router.push("/onboarding/resume")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileUp className="w-8 h-8" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-heading font-medium">Import from Resume</h3>
            <p className="text-muted-foreground font-light text-sm">
              Upload your PDF or DOCX resume. We'll parse it and pre-fill your profile instantly.
            </p>
            <Button variant="outline" className="w-full mt-4 rounded-none">Select</Button>
          </Card>

          <Card 
            className="p-8 cursor-pointer hover:border-primary transition-colors flex flex-col items-center text-center space-y-4 rounded-none bg-card/50"
            onClick={() => router.push("/onboarding/manual")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <PenLine className="w-8 h-8" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-heading font-medium">Manual Entry</h3>
            <p className="text-muted-foreground font-light text-sm">
              Start from scratch. We'll guide you step-by-step through adding your experience and skills.
            </p>
            <Button variant="outline" className="w-full mt-4 rounded-none">Select</Button>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
