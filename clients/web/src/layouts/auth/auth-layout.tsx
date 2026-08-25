import Guard from "@/guards/guard";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Card } from "design/components/ui/card";
import { SocialLoginForms } from "@/features/auth/components/forms/social-form";

const AuthLayout: React.FC = () => {
  React.useEffect(() => {
    document.title = "Auth";
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Guard>
        <div className="h-screen flex flex-col justify-center items-center">
          <h1 className="mb-10 text-primary text-xl font-bold">
            campusandclubs
          </h1>
          <Card className="max-w-md w-full min-h-fit bg-background">
            <Outlet />
            <SocialLoginForms />
          </Card>
        </div>
      </Guard>
    </Suspense>
  );
};

export default AuthLayout;
