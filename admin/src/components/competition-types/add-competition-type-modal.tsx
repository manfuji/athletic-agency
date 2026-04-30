"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { queryClient } from "@/providers/query-provider";
import { createCompetitionType } from "@/actions/competiton-types";
interface AddCompetitionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const competitionTypeSchema = z.object({
  name: z.string().min(1, { message: "Competition type name is required" }),
  description: z.string({
    message: "Description is required",
  }),
});

type CompetitionTypeForm = z.infer<typeof competitionTypeSchema>;

export default function AddCompetitionTypeModal({
  isOpen,
  onClose,
}: AddCompetitionTypeModalProps) {
  const form = useForm<CompetitionTypeForm>({
    resolver: zodResolver(competitionTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CompetitionTypeForm) => {
    try {
      const res = await createCompetitionType(data);
      if ("error" in res) {
        toast.error(String(res.error));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["competition-types"] });
      toast.success("Competition type created successfully");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Failed to create competition type");
      console.error(error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          form.reset();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-normal text-[#000000] dark:text-white">
            ADD COMPETITION TYPE
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="name"
                    className="font-inter font-medium text-[14px] text-[#344054] mb-2 block"
                  >
                    Competition Type
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter competition type"
                      disabled={form.formState.isSubmitting}
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="description"
                    className="font-inter font-medium text-[14px] text-[#344054] mb-2 block"
                  >
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Enter competition type description..."
                      disabled={form.formState.isSubmitting}
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
                variant="outline"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                disabled={form.formState.isSubmitting}
                className="bg-[#302464] hover:bg-[#1f1656]"
              >
                {form.formState.isSubmitting ? "Creating..." : "Add Type"}
                {form.formState.isSubmitting && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
