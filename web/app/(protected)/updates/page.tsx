"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn" },
  { id: "wellfound", name: "Wellfound" },
  { id: "internshala", name: "Internshala" },
];

export default function UpdatePortalPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [synced, setSynced] = useState<Record<string, boolean>>({});

  const handleSync = (platformId: string) => {
    setSyncing(platformId);
    // Mock the extension sync flow
    setTimeout(() => {
      setSyncing(null);
      setSynced(prev => ({ ...prev, [platformId]: true }));
    }, 2500);
  };

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-4xl mx-auto w-full p-8">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-medium text-primary">Update Portal</h1>
        <p className="text-muted-foreground font-light text-xl">
          It's time for the main thing — pushing your updates to every site.
        </p>
      </div>

      <div className="space-y-4">
        {PLATFORMS.map((platform) => {
          const isSyncing = syncing === platform.id;
          const isSynced = synced[platform.id];

          return (
            <Card key={platform.id} className="p-6 flex items-center justify-between rounded-none bg-card hover:border-primary/50 transition-colors border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center font-heading font-medium text-xl text-primary">
                  {platform.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-medium">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isSynced ? "Up to date" : "1 pending update"}
                  </p>
                </div>
              </div>

              <div className="w-40 flex justify-end">
                <AnimatePresence mode="wait">
                  {isSyncing ? (
                    <motion.div
                      key="syncing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-primary"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                      <span className="text-sm font-medium">Syncing...</span>
                    </motion.div>
                  ) : isSynced ? (
                    <motion.div
                      key="synced"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-green-600"
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Synced</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        onClick={() => handleSync(platform.id)}
                        className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Update on {platform.name}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
