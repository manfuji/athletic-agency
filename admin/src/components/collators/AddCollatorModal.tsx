import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { toast } from 'sonner';
import { addCollator } from '@/actions/collators';
import { queryClient } from '@/providers/query-provider';
const collatorSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(/^[A-Za-z]+$/, 'First name must contain only letters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(/^[A-Za-z]+$/, 'Last name must contain only letters'),
  email: z.string().email('Please enter a valid email'),
  contact: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+\d+$/,
      'Phone number must start with "+" followed by digits (e.g., +233123456789)'
    ),
});

type CollatorFormData = z.infer<typeof collatorSchema>;

interface AddCollatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCollatorModal({
  isOpen,
  onClose,
}: AddCollatorModalProps) {
  const [formData, setFormData] = useState<CollatorFormData>({
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CollatorFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = collatorSchema.parse(formData);

      const response = await addCollator({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        contact: validatedData.contact,
      });
      if ("error" in response) {
        const raw = response.error;
        const errObj =
          typeof raw === "object" && raw !== null
            ? (raw as {
                errors?: Record<string, string[]>;
                message?: string;
              })
            : null;
        if (errObj?.errors?.email?.[0]) {
          setErrors({ email: errObj.errors.email[0] });
          toast.error(errObj.errors.email[0]);
        }
        if (errObj?.errors?.first_name?.[0]) {
          setErrors({ first_name: errObj.errors.first_name[0] });
          toast.error(errObj.errors.first_name[0]);
        }
        if (errObj?.errors?.last_name?.[0]) {
          setErrors({ last_name: errObj.errors.last_name[0] });
          toast.error(errObj.errors.last_name[0]);
        }
        toast.error(
          errObj?.message ??
            (typeof raw === "string" ? raw : "Could not add collator")
        );
        return;
      }
      const msg =
        typeof response.message === 'string'
          ? response.message
          : 'Collator added successfully.';
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ['collators'] });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CollatorFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof CollatorFormData;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        toast.error(errorMessage);
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CollatorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-evogria text-[24px] mb-6 font-normal text-[#000000]">
            Add Collator
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="first_name"
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              First name
            </Label>
            <Input
              id="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="mt-1 font-inter font-normal text-[16px] text-[#667085] placeholder:text-[#667085]"
              disabled={isSubmitting}
            />
            {errors.first_name && (
              <p className="mt-1 text-[13px] font-inter text-[#D92D20]">
                {errors.first_name}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="last_name"
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              Last name
            </Label>
            <Input
              id="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="mt-1 font-inter font-normal text-[16px] text-[#667085] placeholder:text-[#667085]"
              disabled={isSubmitting}
            />
            {errors.last_name && (
              <p className="mt-1 text-[13px] font-inter text-[#D92D20]">
                {errors.last_name}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="email"
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              Collator email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 font-inter font-normal text-[16px] text-[#667085] placeholder:text-[#667085]"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-[13px] font-inter text-[#D92D20]">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="contact"
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              Collator phone number
            </Label>
            <Input
              id="contact"
              placeholder="+233"
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              className="mt-1 font-inter font-normal text-[16px] text-[#667085] placeholder:text-[#667085]"
              disabled={isSubmitting}
            />
            {errors.contact && (
              <p className="mt-1 text-[13px] font-inter text-[#D92D20]">
                {errors.contact}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-evogria text-[14px] font-medium text-[#344054] border-[#D0D5DD] hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#302464] text-white hover:bg-[#302464] font-evogria text-[14px] font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Collator'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
