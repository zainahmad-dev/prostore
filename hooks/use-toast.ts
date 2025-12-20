'use client'

import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    // sonner has overloads that aren't exported in its types; keep types permissive without using `any`
    toast: (...args: unknown[]) => (sonnerToast as unknown as (...args: unknown[]) => unknown)(...args),
  }
}
