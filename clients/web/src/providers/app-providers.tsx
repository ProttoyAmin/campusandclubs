import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageHeaderProvider from "./page-header-provider";
import ErrorBundary from "@/shared/pages/error-boundary";
import { TooltipProvider } from "design/components/ui/tooltip";
import { SidebarProvider } from "design/components/ui/sidebar"
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
                <SidebarProvider>
                    <TooltipProvider>
                        <FormDialogProvider>
                            <PageHeaderProvider>
                                {children}
                            </PageHeaderProvider>
                        </FormDialogProvider>
                    </TooltipProvider>
                </SidebarProvider>
            </ErrorBundary>
        </QueryClientProvider>
    );
}