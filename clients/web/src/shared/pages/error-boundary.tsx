import React from "react";
import ConnectionErrorPage from "./connection-error-page";
import ServerErrorPage from "./server-error-page";
import UnexpectedErrorPage from "./unexpected-error-page";
import {
  APP_FAILURE_EVENT,
  type AppFailureDetail,
  type AppFailureKind,
} from "@/shared/lib/app-failure";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  failure: AppFailureKind | null;
  status?: number;
};

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    failure: null,
  };

  static getDerivedStateFromError(error: Error): State {
    const maybeHttpError = error as Error & {
      status?: number;
      response?: { status?: number };
      request?: unknown;
    };
    const status = maybeHttpError.status ?? maybeHttpError.response?.status;

    if (status !== undefined && status >= 500) {
      return { hasError: true, failure: "server", status };
    }

    if (maybeHttpError.request && !maybeHttpError.response) {
      return { hasError: true, failure: "connection" };
    }

    return { hasError: true, failure: null };
  }

  componentDidMount() {
    window.addEventListener(APP_FAILURE_EVENT, this.handleAppFailure);
    window.addEventListener("offline", this.handleOffline);
    window.addEventListener("online", this.handleOnline);

    if (!navigator.onLine) {
      this.setState({ failure: "connection" });
    }
  }

  componentWillUnmount() {
    window.removeEventListener(APP_FAILURE_EVENT, this.handleAppFailure);
    window.removeEventListener("offline", this.handleOffline);
    window.removeEventListener("online", this.handleOnline);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("The app encountered a rendering error.", error, info);
  }

  private handleAppFailure = (event: Event) => {
    const { detail } = event as CustomEvent<AppFailureDetail>;
    this.setState({ failure: detail.kind, status: detail.status });
  };

  private handleOffline = () => {
    this.setState({ failure: "connection", status: undefined });
  };

  private handleOnline = () => {
    if (this.state.failure === "connection") {
      this.setState({ failure: null, status: undefined });
    }
  };

  render() {
    if (this.state.failure === "connection") {
      return <ConnectionErrorPage />;
    }

    if (this.state.failure === "server") {
      return <ServerErrorPage status={this.state.status} />;
    }

    if (this.state.hasError) {
      return <UnexpectedErrorPage />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
