import Guard from "@/guards/guard";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Card } from "design/components/ui/card";

const AuthLayout: React.FC = () => {
  React.useEffect(() => {
    document.title = "Auth";
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <Guard> */}
      <Card className="border max-w-md mx-auto my-auto">
        <Outlet />
      </Card>
      {/* </Guard> */}
    </Suspense>
  );
};

export default AuthLayout;
