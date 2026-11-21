import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ServerCrashIcon } from "@hugeicons/core-free-icons";

type ServerErrorPageProps = {
  status?: number;
};

export default function ServerErrorPage({ status }: ServerErrorPageProps) {
  const isBadGateway = status === 502;

  return (
    <main
      role="alert"
      className="flex min-h-screen w-full items-center justify-center bg-background px-6 py-12"
    >
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={ServerCrashIcon} className="size-8" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {status ? `${status} error` : "Server error"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isBadGateway ? "Bad gateway" : "The server is unavailable"}
          </h1>
          <p className="text-muted-foreground">
            The server may be temporarily down or restarting. Please try again
            in a moment.
          </p>
        </div>
        <Button variant="outline" size="lg" className={"rounded-full w-1/2"} onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
