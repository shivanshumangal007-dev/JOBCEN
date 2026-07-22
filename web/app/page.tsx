"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const hasProfile = useStore((state) => state.hasProfile);
  const router = useRouter();

  const handleCtaClick = () => {
    if (hasProfile) {
      router.push("/edit");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <PageTransition className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 min-h-[100dvh]">
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8">
        <AnimatedText 
          text="JOBCEN" 
          className="text-6xl md:text-8xl lg:text-[10rem] font-medium tracking-tighter text-primary uppercase" 
        />
        
        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl font-light">
          Update your career profile in just one click.
        </p>

        <div className="pt-12">
          <MagneticButton>
            <Button 
              onClick={handleCtaClick}
              size="lg" 
              className="rounded-none px-8 py-6 text-lg tracking-wide uppercase flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {hasProfile ? "Edit Portal" : "Get Started"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </MagneticButton>
        </div>
      </div>
    </PageTransition>
  );
}
