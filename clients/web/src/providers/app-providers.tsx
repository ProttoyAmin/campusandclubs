import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageHeaderProvider from "./page-header-provider";
import ErrorBundary from "@/shared/pages/error-boundary";

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
                <PageHeaderProvider>
                    {children}
                </PageHeaderProvider>
            </ErrorBundary>
        </QueryClientProvider>
    );
}