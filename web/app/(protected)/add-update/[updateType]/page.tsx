"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { DynamicUpdateForm, SchemaType, updateSchemas } from "@/components/forms/DynamicUpdateForm";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { use, useState } from "react";
import { useAddPendingBulkSync } from "@/hooks/updatesBackend";

export default function UpdateFormPage({ params }: { params: Promise<{ updateType: string }> }) {
  const router = useRouter();
  const { updateType } = use(params);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const AddPendingBulkSyncHook = useAddPendingBulkSync();
  
  const decodedType = decodeURIComponent(updateType) as SchemaType;
  const isValidType = Object.keys(updateSchemas).includes(decodedType);

  if (!isValidType) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh]">
        <h1 className="text-2xl font-medium mb-4">Invalid Update Type</h1>
        <Button onClick={() => router.push("/edit")}>Return to Edit Portal</Button>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    // addUpdate({
    //   type: decodedType as any,
    //   data
    // });
    setIsSubmitting(true)
    try {
      const response = await AddPendingBulkSyncHook.mutateAsync({
        platforms: ["linkedin", "internshala", "wellfound"],
        data_updated: {
          type: decodedType,
          data: data
        }
      });
      console.log(response);
      toast.success(`${decodedType} update saved successfully.`);
      router.push("/updates");
    } catch (error) {
      console.log(error);
    }
    finally{
      setIsSubmitting(false)
    }
  };

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-2xl mx-auto w-full p-8">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="space-y-4 mb-10">
        <h1 className="text-4xl font-heading font-medium text-primary">
          Log an Update: <span className="italic font-light">{decodedType}</span>
        </h1>
        <p className="text-muted-foreground font-light text-lg">
          Fill in the details below. This will be added to your master profile and timeline.
        </p>
      </div>

      <DynamicUpdateForm type={decodedType} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageTransition>
  );
}
