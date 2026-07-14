"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { getReviews } from "@/lib/actions/review.actions";
import { Review } from "@/types";
import Rating from "./rating";
import ReviewForm from "./review-form";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId?: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = useCallback(async () => {
    const res = await getReviews({ productId });
    setReviews(res.data);
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <p>No reviews yet</p>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={loadReviews}
        />
      ) : (
        <p>
          Please{" "}
          <Link
            className="text-blue-700 px-1"
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review
        </p>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle>{review.title}</CardTitle>
              <Rating value={review.rating} />
            </CardHeader>
            <CardContent>
              <p>{review.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                {review.isVerifiedPurchase && (
                  <Badge variant="outline">Verified Purchase</Badge>
                )}
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {review.user?.name ?? "User"}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />{" "}
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
