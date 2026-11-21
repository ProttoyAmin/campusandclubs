import { Button } from "design/components/ui/button";

export default function UnexpectedErrorPage() {
  return (
    <main
      role="alert"
      className="flex min-h-screen w-full items-center justify-center bg-background px-6 py-12"
    >
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Unexpected error
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            Please reload the app and try again.
          </p>
        </div>
        <Button size="lg" onClick={() => window.location.reload()}>
          Reload app
        </Button>
      </div>
    </main>
  );
}
