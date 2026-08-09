import Guard from "@/guards/guard";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
// import { PublicOnlyRoute } from "@/guards";



const AuthLayout: React.FC = () => {

    React.useEffect(() => {
      document.title = "Auth";
    }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Guard>
      <Outlet/>
      {/* <PublicOnlyRoute children={<Outlet />} /> */}
      </Guard>
    </Suspense>
  );
};

export default AuthLayout;
