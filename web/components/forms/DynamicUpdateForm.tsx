"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define schemas
export const updateSchemas = {
  "Experience": z.object({
    company: z.string().min(1, "Company is required"),
    title: z.string().min(1, "Title is required"),
    location: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().optional(),
  }),
  "Education": z.object({
    school: z.string().min(1, "School is required"),
    degree: z.string().min(1, "Degree is required"),
    field: z.string().optional(),
    year: z.string().optional(),
  }),
  "Project": z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    link: z.string().url().optional().or(z.literal("")),
  }),
  "Skill": z.object({
    name: z.string().min(1, "Skill name is required"),
  }),
  "Link": z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  }),
  "Bio": z.object({
    bio: z.string().min(1, "Bio cannot be empty"),
  }),
  "Basic Info": z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().optional(),
    bio: z.string().optional(),
  })
};

export type SchemaType = keyof typeof updateSchemas;

export function DynamicUpdateForm({ 
  type, 
  defaultValues = {}, 
  onSubmit 
}: { 
  type: SchemaType, 
  defaultValues?: any, 
  onSubmit: (data: any) => void 
}) {
  const schema = updateSchemas[type];
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...Object.keys(schema.shape).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {} as any),
      ...defaultValues
    },
  });

  const fields = Object.keys(schema.shape);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((fieldKey) => (
          <FormField
            key={fieldKey}
            control={form.control}
            name={fieldKey}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {fieldKey.replace(/([A-Z])/g, " $1").trim()}
                </FormLabel>
                <FormControl>
                  {fieldKey === "description" || fieldKey === "bio" ? (
                    <Textarea 
                      {...field} 
                      className="rounded-none border-border focus-visible:ring-primary min-h-[120px] resize-none"
                    />
                  ) : (
                    <Input 
                      {...field} 
                      className="rounded-none border-border focus-visible:ring-primary py-6 text-base"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full rounded-none py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Update
        </Button>
      </form>
    </Form>
  );
}
