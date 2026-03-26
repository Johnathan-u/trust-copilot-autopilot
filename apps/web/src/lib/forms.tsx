"use client";

import {
  useForm,
  FormProvider,
  useFormContext,
  type FieldValues,
  type UseFormReturn,
  type DefaultValues,
  type Path,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, type ReactNode, type FormEvent } from "react";

interface FormWrapperProps<T extends FieldValues> {
  schema: Parameters<typeof zodResolver>[0];
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => ReactNode;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormWrapperProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    defaultValues,
  });

  const { formState: { isDirty } } = form;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        {children(form)}
      </form>
    </FormProvider>
  );
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn("space-y-1", className)}>
      <label className="block font-mono text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-accent-red ml-0.5">*</span>}
      </label>
      <Input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={cn(error && "border-accent-red focus:border-accent-red")}
      />
      {error && (
        <p className="font-mono text-[0.6rem] text-accent-red">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}

interface FormActionsProps {
  submitLabel?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  onCancel?: () => void;
}

export function FormActions({
  submitLabel = "Save",
  isSubmitting,
  isDirty,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={isSubmitting || !isDirty} size="sm">
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
      {isDirty && (
        <span className="font-mono text-[0.6rem] text-accent-yellow">
          Unsaved changes
        </span>
      )}
    </div>
  );
}
