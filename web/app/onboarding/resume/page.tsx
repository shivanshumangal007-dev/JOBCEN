"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useResumeUpload from "@/hooks/Profile";
import { useStore } from "@/store/useStore";
import { UploadCloud, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ResumeUploadPage() {
  const router = useRouter();
  const setHasProfile = useStore((state) => state.setHasProfile);
  const updateProfile = useStore((state) => state.updateProfile);
  
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const resumeUpload = useResumeUpload();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    resumeUpload.mutate(file);
    // setParsedData(data);
  };

  const handleSave = () => {
    // Save to store and proceed
    updateProfile({
      name: parsedData.name.value,
      bio: parsedData.bio.value,
      location: parsedData.location.value,
    });
    setHasProfile(true);
    router.push("/dashboard");
  };

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-4xl mx-auto w-full p-8">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="space-y-2 mb-10">
          <h1 className="text-4xl font-heading font-medium text-primary">Import your Resume</h1>
          <p className="text-muted-foreground font-light text-lg">
            Upload your existing resume to instantly build your master profile.
          </p>
        </div>

        {!parsedData ? (
          <Card className="flex-1 flex flex-col items-center justify-center p-12 border-dashed border-2 rounded-none bg-card/50">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <UploadCloud className="w-10 h-10 text-primary" strokeWidth={1} />
            </div>
            <h3 className="text-xl font-medium mb-2">Drag and drop your file here</h3>
            <p className="text-muted-foreground mb-8">Supports PDF, DOCX up to 10MB</p>
            
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".pdf,.docx" 
                className="max-w-[250px] cursor-pointer"
                onChange={handleFileChange}
              />
              <Button 
                onClick={handleUpload} 
                disabled={!file || isParsing}
                className="rounded-none px-8"
              >
                {isParsing ? "Parsing..." : "Upload"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 bg-primary/5 p-4 border border-primary/20">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-medium text-primary">Parsing Complete</h4>
                <p className="text-sm text-muted-foreground">Please verify the details below. We've highlighted fields that might need your attention.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  defaultValue={parsedData.name.value}
                  onChange={(e) => setParsedData({...parsedData, name: { ...parsedData.name, value: e.target.value }})}
                  className="rounded-none border-border focus-visible:ring-primary text-lg py-6"
                />
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="location" className="text-xs uppercase tracking-wider flex items-center gap-2 text-destructive">
                  Location <AlertTriangle className="w-3 h-3" /> (Low Confidence)
                </Label>
                <Input 
                  id="location" 
                  defaultValue={parsedData.location.value}
                  onChange={(e) => setParsedData({...parsedData, location: { ...parsedData.location, value: e.target.value }})}
                  className="rounded-none border-destructive/50 focus-visible:ring-destructive text-lg py-6"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground">Bio / Headline</Label>
                <Input 
                  id="bio" 
                  defaultValue={parsedData.bio.value}
                  onChange={(e) => setParsedData({...parsedData, bio: { ...parsedData.bio, value: e.target.value }})}
                  className="rounded-none border-border focus-visible:ring-primary text-lg py-6"
                />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex justify-end gap-4">
              <Button variant="outline" className="rounded-none px-8" onClick={() => setParsedData(null)}>
                Start Over
              </Button>
              <Button onClick={handleSave} className="rounded-none px-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Looks Good, Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
