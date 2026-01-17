// Re-export from sonner for compatibility
import { toast as sonnerToast } from 'sonner';

export const toast = sonnerToast;

// For components expecting useToast hook
export function useToast() {
  return {
    toast: sonnerToast,
  };
}

