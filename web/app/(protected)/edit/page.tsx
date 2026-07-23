"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, GraduationCap, Code, Lightbulb, Link2, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EDIT_OPTIONS = [
  { id: "Experience", label: "Work Experience", icon: Briefcase, description: "Add a new role or update your current one." },
  { id: "Education", label: "Education", icon: GraduationCap, description: "Add a degree, bootcamp, or certification." },
  { id: "Project", label: "Project", icon: Code, description: "Shipped something new? Log it here." },
  { id: "Skill", label: "Skill", icon: Lightbulb, description: "Learned a new tool or framework." },
  { id: "Link", label: "Link", icon: Link2, description: "Add a portfolio, social profile, or article." },
  { id: "Bio", label: "Bio", icon: FileText, description: "Update your headline or summary." },
];

export default function EditPortalPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredOptions = EDIT_OPTIONS.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    opt.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-4xl mx-auto w-full p-8">
      <div className="space-y-4 mb-12 mt-12">
        <h1 className="text-4xl md:text-5xl font-heading font-medium text-primary">Edit Portal</h1>
        <p className="text-muted-foreground font-light text-xl">
          What do you want to update today?
        </p>
      </div>

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
        <Input 
          placeholder="Search for an update type... (e.g. 'work experience')" 
          className="pl-14 py-8 text-xl rounded-none border-border focus-visible:ring-primary shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredOptions.map((option) => (
          <Card 
            key={option.id}
            className="p-6 cursor-pointer hover:border-primary transition-all group flex items-start gap-4 rounded-none bg-card/50 hover:bg-card"
            onClick={() => router.push(`/edit/${option.id}`)}
          >
            <div className="w-12 h-12 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <option.icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{option.label}</h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </div>
              <p className="text-sm text-muted-foreground font-light leading-snug">
                {option.description}
              </p>
            </div>
          </Card>
        ))}
        {filteredOptions.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No update types match your search.
          </div>
        )}
      </div>
    </PageTransition>
  );
}
