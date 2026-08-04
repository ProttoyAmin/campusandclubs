import React from 'react'
import ProfilePage from '~/features/user/pages/public/profile'
import type { Route } from './+types/profile';
import { profileLoader } from '~/features/user/loaders/user.loaders';

export function meta({params}: Route.MetaArgs) {
  return [
    { title: params.username },
    { name: "description", content: "View and edit your profile" + params.username },
  ];
}

export async function loader(args: Route.LoaderArgs) {
    console.log("ROUTE LOADER");
//   return profileLoader(args);
}

export default function Profile() {
  return <ProfilePage />;
}
