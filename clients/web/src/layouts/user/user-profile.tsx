import React from "react";
import { useParams, Outlet } from "react-router-dom";

export type UserProfileLayoutProps = {
  username: string;
};

export const UserProfileLayout: React.FC = () => {
  const { username } = useParams();

  React.useEffect(() => {
    document.title = `@${username}`;
  }, [username]);
  

  return (
    <div>
      <h1>User Profile</h1>
      <Outlet context={username}/>
    </div>
  );
};

