import React from "react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { useMeSessions } from "@/features/user/hooks/user.hooks";
import { useRevokeSession } from "@/features/user/hooks/user.hooks";
import {
  excludeCurrentSession,
  findCurrentSession,
} from "@/features/user/services/utils";
import type { UserSessions } from "@/features/user/api/user.client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ComputerIcon,
  ComputerPhoneSyncIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import { routes } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import { getTimeAgo } from "@/utils/format-date";
import { Skeleton } from "design/components/ui/skeleton";

export const SessionsPageSkeleton = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="p-3 w-40" />
        <Skeleton className="p-3" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="p-3 w-20" />
        <Skeleton className="p-10" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="p-3 w-20" />
        <Skeleton className="p-3" />
        <Skeleton className="p-4 w-25" />
      </div>
    </div>
  );
};

const SessionsPage = () => {
  const pageHeader = usePageHeader();
  const { data: sessions, isLoading, isError } = useMeSessions();
  const currentSession = findCurrentSession(sessions);
  // const otherSessions = React.useMemo(
  //   () => excludeCurrentSession(sessions),
  //   [sessions],
  // );

  React.useEffect(() => {
    const id = pageHeader.push(
      <div className="flex items-center gap-4">
        <NavigateButtons hideForward />
        <h1 className="text-lg font-semibold">Sessions</h1>
      </div>,
    );

    return () => {
      pageHeader.pop(id);
    };
  }, [pageHeader.push, pageHeader.pop]);

  if (isLoading) {
    return <SessionsPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1 mb-4">
        <h2 className="text-lg font-semibold">Active sessions</h2>
        <p className="text-sm text-muted-foreground">
          These are the active sessions across all your devices. If you notice
          any unusual activity, you can sign out of that session.
        </p>
      </div>
      {/* <pre>{JSON.stringify(sessions, null, 2)}</pre> */}
      <div className="flex flex-col gap-3">
        {currentSession && (
          <div className="">
            <h1 className="text-md text-muted-foreground">Current session</h1>
            <div className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-2">
                {currentSession.kind === "web" ? (
                  <div className="p-3 border">
                    <HugeiconsIcon icon={ComputerIcon} />
                  </div>
                ) : (
                  <div className="p-3 border">
                    <HugeiconsIcon icon={SmartPhone01Icon} />
                  </div>
                )}
                <div>
                  <div className="text-md font-semibold flex gap-2.5">
                    {currentSession.os}{" "}
                    <span className="text-muted-foreground">•</span>{" "}
                    <span className="text-muted-foreground">
                      {currentSession.browser}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dhaka, Bangladesh
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <ul className="space-y-4">
          <h1 className="text-md text-muted-foreground">Other sessions</h1>
          {sessions && sessions.data && sessions.data.length > 0 ? (
            sessions.data
              .filter((s) => s?.id !== currentSession?.id)
              .map((session) => (
                <li key={session.id} className="">
                  <div className="flex w-full justify-between items-center">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex items-center gap-2">
                        {session.kind === "web" ? (
                          <div className="py-4 px-3 border">
                            <HugeiconsIcon icon={ComputerIcon} />
                          </div>
                        ) : (
                          <div className="p-3 border">
                            <HugeiconsIcon icon={SmartPhone01Icon} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold flex gap-2.5">
                            {session.os}{" "}
                            <span className="text-md text-muted-foreground">
                              •
                            </span>{" "}
                            <span className="text-md text-muted-foreground">
                              {session.browser}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dhaka, Bangladesh
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Last seen {getTimeAgo(session.last_seen_at)} ago
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="icon-lg" variant="ghost">
                      <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                    </Button>
                  </div>
                </li>
              ))
          ) : (
            <li>No active sessions.</li>
          )}
        </ul>
      </div>
      <div className="p-4 text-muted-foreground flex gap-5 items-center">
        <div className="p-3 border">
          <HugeiconsIcon icon={ComputerPhoneSyncIcon} className="" />
        </div>
        <div>
          <p>Some older sessions may not be shown here.</p>
          <p>
            To log them out, please{" "}
            <Link
              to={routes.settings.account.password}
              className="text-blue-400"
            >
              change password
            </Link>
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2.5 items-start">
        <div className="">
          <h1>Log out of all known sessions.</h1>
          <p className="text-muted-foreground">
            You'll have to log back in on all logged out devices.
          </p>
        </div>
        <Button variant="destructive">Log out all sessions</Button>
      </div>
    </div>
  );
};

export default SessionsPage;
