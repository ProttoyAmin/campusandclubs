import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageHeaderProvider from "./page-header-provider";
import ErrorBoundary from "@/shared/pages/error-boundary";
import { TooltipProvider } from "design/components/ui/tooltip";
import FormDialogProvider from "./form-dialog-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { VITE_GOOGLE_CLIENT_ID } from "@/settings/app/env";

export function AppProviders({
    queryClient,
    children,
}: {
    queryClient: QueryClient;
    children: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <FormDialogProvider>
                        <PageHeaderProvider>
                            <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID || ""}>
                                {children}
                            </GoogleOAuthProvider>
                        </PageHeaderProvider>
                    </FormDialogProvider>
                </TooltipProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
