import React from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { Button } from "design/components/ui/button";
import { ArrowLeftIcon, MoreHorizontalIcon, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";

export type UserProfileLayoutProps = {
  username: string;
};

export const UserProfileLayout: React.FC = () => {
  const { username } = useParams();
  
  const navigate = useNavigate();
  const location = useLocation();
  const pageHeader = usePageHeader();

  React.useEffect(() => {
    document.title = `@${username}`;
  }, [username]);

  React.useEffect(() => {
    pageHeader.setActions(
      <>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              className={`rounded-full ${location.pathname === document.location.pathname ? 'invisible' : ''}`}
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <p className="text-lg">{username}</p>
          </div>
        <div className="flex gap-2">
          <Button variant={"ghost"} className={"rounded-full"} size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant={"ghost"} className={"rounded-full"} size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </>,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [username, navigate, pageHeader.setActions, pageHeader.clearActions]);

  return (
    <section className="flex flex-col gap-8 w-2xl">
      <div className="flex justify-between items-center">{pageHeader.actions}</div>
      <div className="">
        <Outlet context={username} />
      </div>
    </section>
  );
};
