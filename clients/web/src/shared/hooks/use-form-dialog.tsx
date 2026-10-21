import { useContext } from "react";
import { FormDialogContext } from "@/shared/contexts/form-dialog-context";

export function useFormDialog() {
    const context = useContext(FormDialogContext);

    if (!context) {
        throw new Error("useFormDialog must be used inside a FormDialogProvider");
    }

    return context;
}