"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, ArrowRight, Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const updates = useStore((state) => state.updates);

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-5xl mx-auto w-full p-8 md:py-16">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-heading font-medium text-primary uppercase tracking-tight">
            {profile.name || "Your Name"}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground font-light text-lg">
            {profile.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> {profile.location}
              </span>
            )}
          </div>
          <p className="text-xl max-w-2xl font-light text-foreground/90 mt-2">
            {profile.bio || "Add a bio to complete your master profile."}
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="rounded-none px-6 uppercase tracking-widest text-xs h-12"
            onClick={() => router.push("/updates")}
          >
            <Activity className="w-4 h-4 mr-2" />
            Sync Status
          </Button>
          <Button 
            className="rounded-none px-6 uppercase tracking-widest text-xs h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push("/edit")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Update
          </Button>
        </div>
      </header>

      <Separator className="mb-16 bg-border" />

      <div className="grid md:grid-cols-12 gap-12">
        
        <div className="md:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-heading font-medium">Timeline</h2>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {updates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic font-light relative z-10 bg-background">
                Your timeline is empty. Log your first update to see it here.
              </div>
            ) : (
              updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20 z-10">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>

                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-none bg-card hover:border-primary/50 transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">
                        {update.type}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {update.data.title || update.data.company || update.data.school || update.data.name || "Update Logged"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {update.data.description || update.data.bio || "No additional details provided."}
                    </p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-4 space-y-8">
          <Card className="p-6 rounded-none bg-primary/5 border-none">
            <h3 className="text-xl font-heading font-medium mb-4">Platforms</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You have pending updates to sync to your connected platforms.
            </p>
            <Button 
              className="w-full rounded-none group"
              onClick={() => router.push("/updates")}
            >
              Go to Update Portal
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>

      </div>
    </PageTransition>
  );
}
