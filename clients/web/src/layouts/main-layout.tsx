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
    const [user, setUser] = React.useState({ name: "Alex", role: "Admin" });
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet context={{user, setUser}}/>
    </Suspense>
  );
};

export default MainLayout;
