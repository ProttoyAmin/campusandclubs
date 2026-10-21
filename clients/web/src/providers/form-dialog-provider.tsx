import React, { useRef } from "react";
import {
    FormDialogContext,
    type FormDialogContextType,
} from "@/shared/contexts/form-dialog-context";

type FormDialogProviderProps = {
    children: React.ReactNode;
};

export default function FormDialogProvider({
    children,
}: FormDialogProviderProps) {
    const dirtyCheckerRef = useRef<(() => boolean) | null>(null);

    const registerDirtyChecker = (checker: () => boolean) => {
        dirtyCheckerRef.current = checker;
    };

    const checkDirty = (): boolean => {
        const isDirty = dirtyCheckerRef.current?.();
        if (isDirty === undefined) {
            return false;
        }
        return isDirty;
    };

    const value: FormDialogContextType = {
        registerDirtyChecker: registerDirtyChecker,
        checkDirty: checkDirty,
    };

    return (
        <FormDialogContext.Provider value={value}>
            {children}
        </FormDialogContext.Provider>
    );
}
