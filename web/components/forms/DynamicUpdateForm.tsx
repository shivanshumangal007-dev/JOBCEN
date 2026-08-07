"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";

// Define schemas
export const updateSchemas = {
  Experience: z.object({
    company: z.string().min(1, "Company is required"),
    title: z.string().min(1, "Title is required"),
    location: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  }),
  Education: z.object({
    institution: z.string().min(1, "institute is required"),
    degree: z.string().min(1, "Degree is required"),
    field_of_study: z.string().optional(),
    start_year: z.string().optional(),
    graduation_year: z.string().optional(),
    gpa: z.float32().min(0, "gpa cant be zero").max(10, "gpa cant be more than 10"),
    max_gpa: z.float32().min(0, "gpa cant be zero").max(10, "gpa cant be more than 10"),
    description: z.string().optional(),
  }),
  Project: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    github_url: z.string().url().optional().or(z.literal("")),
    url: z.string().url().or(z.literal("")),
    technologies: z.array(z.string()).optional(),
  }),
  Skill: z.object({
    skills: z.array(z.string()).min(1, "Atleast one skill is required"),
  }),
  Link: z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  }),
  Bio: z.object({
    bio: z.string().min(1, "Bio cannot be empty"),
  }),
  "Basic Info": z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().optional(),
    bio: z.string().optional(),
  }),
};

export type SchemaType = keyof typeof updateSchemas;

function ArrayFieldInput({ field, fieldKey }: { field: any; fieldKey: string }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        field.onChange([...(field.value || []), inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeItem = (index: number) => {
    const newValue = [...(field.value || [])];
    newValue.splice(index, 1);
    field.onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {field.value && field.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {field.value.map((item: string, index: number) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-muted-foreground hover:text-foreground ml-1 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Add ${fieldKey.replace(/([A-Z])/g, " $1").trim().toLowerCase()}...`}
        className="rounded-none border-border focus-visible:ring-primary py-6 text-base"
      />
      <div className="text-xs text-muted-foreground">Press enter to add</div>
    </div>
  );
}

export function DynamicUpdateForm({
  type,
  defaultValues = {},
  onSubmit,
  isSubmitting,
}: {
  type: SchemaType;
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const schema = updateSchemas[type];
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...Object.keys(schema.shape).reduce((acc, key) => {
        const fieldDef = (schema.shape as any)[key];
        const isArray =
          fieldDef instanceof z.ZodArray ||
          (fieldDef instanceof z.ZodOptional && fieldDef.unwrap() instanceof z.ZodArray);
        acc[key] = isArray ? [] : "";
        return acc;
      }, {} as any),
      ...defaultValues,
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
                  {(() => {
                    const fieldDef = (schema.shape as any)[fieldKey];
                    const isArray =
                      fieldDef instanceof z.ZodArray ||
                      (fieldDef instanceof z.ZodOptional && fieldDef.unwrap() instanceof z.ZodArray);

                    if (isArray) {
                      return <ArrayFieldInput field={field} fieldKey={fieldKey} />;
                    }
                    if (fieldKey === "description" || fieldKey === "bio") {
                      return (
                        <Textarea
                          {...field}
                          className="rounded-none border-border focus-visible:ring-primary min-h-[120px] resize-none"
                        />
                      );
                    }
                    return (
                      <Input
                        {...field}
                        className="rounded-none border-border focus-visible:ring-primary py-6 text-base"
                      />
                    );
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="submit"
          className="w-full rounded-none py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Save Update"
          )}
        </Button>
      </form>
    </Form>
  );
}
