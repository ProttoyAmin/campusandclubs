import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageHeaderProvider from "./page-header-provider";
import ErrorBundary from "@/shared/pages/error-boundary";
import { TooltipProvider } from "design/components/ui/tooltip";
import FormDialogProvider from "./form-dialog-provider";

export function AppProviders({
    queryClient,
    children,
}: {
    queryClient: QueryClient;
    children: React.ReactNode;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBundary>
                <TooltipProvider>
                    <FormDialogProvider>
                        <PageHeaderProvider>
                            {children}
                        </PageHeaderProvider>
                    </FormDialogProvider>
                </TooltipProvider>
            </ErrorBundary>
        </QueryClientProvider>
    );
}