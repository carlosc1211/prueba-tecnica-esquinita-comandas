import type { z } from "zod";

export type FieldErrors = Record<string, string>;

export type ActionState = {
  ok: boolean;
  message: string | null;
  fieldErrors: FieldErrors;
};

export const initialActionState: ActionState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) {
      result[key] = value;
    }
  }
  return result;
}

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function invalid(error: z.ZodError): ActionState {
  return { ok: false, message: "Revisa los campos marcados", fieldErrors: toFieldErrors(error) };
}

export function failure(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export function success(message: string): ActionState {
  return { ok: true, message, fieldErrors: {} };
}
