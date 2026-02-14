import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Restrict phone to max 10 digits (Indian mobile) */
export function restrictPhone10(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits.slice(0, 10)
}
