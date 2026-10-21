import { Button } from "design/components/ui/button";
import React from "react";

type Props = {
    children: React.ReactNode;
};

type state = {
    hasError: boolean;
};

class ErrorBundary extends React.Component<Props, state> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error(error, info);
    }

    render() {
        console.log("error rendered");
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
                        <p className="text-gray-400 mb-6">Please try again later.</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="cursor-pointer"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBundary;