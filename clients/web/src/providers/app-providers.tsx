import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageHeaderProvider from "./page-header-provider";

export function AppProviders({
    queryClient,
    children,
}: {
    queryClient: QueryClient;
    children: React.ReactNode;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <PageHeaderProvider>
                {children}
            </PageHeaderProvider>
        </QueryClientProvider>
    );
}