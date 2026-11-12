import Guard from "@/guards/guard";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Card } from "design/components/ui/card";
import { SocialLoginForms } from "@/features/auth/components/forms/social-form";
import { APP_NAME } from "@/config/constants";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { useSession } from "@/features/auth/hooks";

const AuthLayout: React.FC = () => {
  const pageHeader = usePageHeader();
  const { data: session } = useSession()

  React.useEffect(() => {
    document.title = `Auth • ${APP_NAME}`;
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Guard>
        <section className="h-screen w-full flex flex-col items-center justify-center">
          <div className="flex flex-col justify-center items-center min-w-110 min-h-110">
            <div className="flex gap-2.5 w-full justify-between items-center mb-10">
              {pageHeader.actions ?? <div className="w-8 h-8"></div>}
              <h1 className="text-primary text-xl font-bold">
                {APP_NAME.toLocaleLowerCase().split(' ')}
              </h1>
              <div className="w-8 h-8"></div>
            </div>
            <Card className="max-w-md w-full min-h-fit bg-background">
              <Outlet context={{ authState: session }} />
              <SocialLoginForms />
            </Card>
          </div>
        </section>
      </Guard>
    </Suspense>
  );
};

export default AuthLayout;
