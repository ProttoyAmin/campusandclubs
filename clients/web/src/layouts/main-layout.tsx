import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
// import { ProtectedRoute } from '@/guards';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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
      <ReactQueryDevtools initialIsOpen={false} />
      <Outlet />
      {/* <ProtectedRoute children={<Outlet />} /> */}
    </Suspense>
  );
};

export default MainLayout;
