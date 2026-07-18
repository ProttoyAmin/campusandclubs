import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";

export type MainLayoutContext = {
  user: {
    name: string;
    role: string;
  };
  setUser: React.Dispatch<
    React.SetStateAction<{
      name: string;
      role: string;
    }>
  >;
};


const MainLayout: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet />
    </Suspense>
  );
};

export default MainLayout;
