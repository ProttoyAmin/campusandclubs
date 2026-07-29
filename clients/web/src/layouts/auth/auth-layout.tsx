import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
// import { PublicOnlyRoute } from "@/guards";



const AuthLayout: React.FC = () => {

    React.useEffect(() => {
      document.title = "Auth";
    }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet/>
      {/* <PublicOnlyRoute children={<Outlet />} /> */}
    </Suspense>
  );
};

export default AuthLayout;
