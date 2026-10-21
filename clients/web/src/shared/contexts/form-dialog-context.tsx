import { createContext } from "react";

export type FormDialogContextType = {
    registerDirtyChecker: (checker: () => boolean) => void;
    checkDirty: () => boolean;
};

export const FormDialogContext = createContext<FormDialogContextType | null>(
    null
);