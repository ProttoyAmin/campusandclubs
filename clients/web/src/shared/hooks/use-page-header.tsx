import { useContext } from "react";
import { PageHeaderContext } from "../contexts/page-header-context";

export function usePageHeader() {
    const context = useContext(PageHeaderContext)

    if (!context) {
        throw new Error("usePageHeader must be used within a Page Header Provider")
    }

    return context
}