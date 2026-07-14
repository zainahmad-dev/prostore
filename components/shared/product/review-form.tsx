"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertReviewSchema } from "@/lib/validator";
import { reviewFormDefaultValues } from "@/lib/constants";
import {
  createUpdateReview,
  getReviewByProductId,
} from "@/lib/actions/review.actions";

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  type ReviewFormInput = z.input<typeof insertReviewSchema>;
  type ReviewFormOutput = z.output<typeof insertReviewSchema>;

  const form = useForm<ReviewFormInput, unknown, ReviewFormOutput>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaultValues,
  });

  // Fetches the user's existing review (if any) and resets the form before
  // opening the dialog, so it can't be shown mid-fetch and then wiped by a
  // late form.reset() while the user is already typing.
  const handleOpenForm = async () => {
    setIsLoading(true);
    try {
      const existingReview = await getReviewByProductId({ productId });

      form.reset(
        existingReview
          ? {
              title: existingReview.title,
              description: existingReview.description,
              rating: existingReview.rating,
              productId,
              userId,
            }
          : { ...reviewFormDefaultValues, productId, userId }
      );

      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof insertReviewSchema>) => {
    const res = await createUpdateReview({ ...values, productId, userId });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setOpen(false);
    onReviewSubmitted();
    toast.success(res.message);
  };

  return (
    <>
      <Button onClick={handleOpenForm} disabled={isLoading} variant="default">
        {isLoading ? "Loading..." : "Write a review"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Write a review</DialogTitle>
                <DialogDescription>
                  Share your thoughts with other customers
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              aria-label={`Rate ${star} out of 5`}
                            >
                              <Star
                                className={cn(
                                  "w-6 h-6 transition-colors",
                                  star <= Number(field.value)
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewForm;
