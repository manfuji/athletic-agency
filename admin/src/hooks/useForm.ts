import { useState, useRef, ChangeEvent } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

export function useForm<T extends { [key: string]: unknown }>(
  initialData: T,
  schema: z.ZodType<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<z.ZodFormattedError<T, string>>(
    {} as z.ZodFormattedError<T, string>
  );
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (
    field: keyof T,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PNG and JPG are supported.");
      return;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      if (fileRefs.current[field as string]) {
        fileRefs.current[field as string]!.value = "";
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
    fileRefs.current[field as string] = e.target as HTMLInputElement;
  };

  const validateAndSubmit = async (
    onSubmit: (formData: FormData) => Promise<void>
  ) => {
    const validation = schema.safeParse(data);
    if (!validation.success) {
      setErrors(validation.error.format());
      toast.error("Please fill in all required fields correctly");
      return false;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (fileRefs.current[key]?.files?.[0]) {
        formData.append(key, fileRefs.current[key].files![0]);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    await onSubmit(formData);
    return true;
  };

  return {
    data,
    setData,
    errors,
    handleChange,
    handleFileChange,
    validateAndSubmit,
    fileRefs,
  };
}
