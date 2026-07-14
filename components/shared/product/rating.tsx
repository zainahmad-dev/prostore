import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Rating = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const diff = value - index;
        return (
          <Star
            key={index}
            className={cn(
              "w-4 h-4",
              diff >= 1
                ? "fill-yellow-500 text-yellow-500"
                : diff > 0
                ? "fill-yellow-500/50 text-yellow-500"
                : "text-muted-foreground"
            )}
          />
        );
      })}
    </div>
  );
};

export default Rating;
