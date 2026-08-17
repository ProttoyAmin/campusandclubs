// hooks/use-server-errors.ts
import type { AppError } from "@/settings/app/error";
import { useEffect } from "react";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

type ServerErrorShape = Record<string, unknown>;

export function useServerErrors<T extends FieldValues>(
  serverErrors: ServerErrorShape | undefined,
  setError: UseFormSetError<T>,
) {
  useEffect(() => {
    if (!serverErrors) return;

    for (const [field, messages] of Object.entries(serverErrors)) {
      const message = Array.isArray(messages) ? messages[0] : messages;
      console.log("setting error for", field, message);
      if (!message) continue;

      setError(field as Path<T>, { type: "server", message });
    }
  }, [serverErrors, setError]);
}
