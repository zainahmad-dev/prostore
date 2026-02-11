'use client'

import { toast as sonnerToast } from 'sonner';

type ToastInput = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | string;
  [key: string]: unknown;
};

const isToastObject = (value: unknown): value is ToastInput =>
  typeof value === 'object' &&
  value !== null &&
  ('title' in value || 'description' in value || 'variant' in value);

export function useToast() {
  return {
    // sonner has overloads that aren't exported in its types; keep types permissive without using `any`
    toast: (messageOrOptions: unknown, options?: unknown) => {
      if (isToastObject(messageOrOptions)) {
        const { title, description, variant, ...rest } = messageOrOptions;
        const message = title ?? description ?? '';
        const toastOptions = {
          description: title ? description : undefined,
          ...rest,
        } as Record<string, unknown>;

        if (variant === 'destructive') {
          return sonnerToast.error(message, toastOptions);
        }

        return sonnerToast(message, toastOptions);
      }

      return (sonnerToast as unknown as (arg1: unknown, arg2?: unknown) => unknown)(
        messageOrOptions,
        options
      );
    },
  };
}
