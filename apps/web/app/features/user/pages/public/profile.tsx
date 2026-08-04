import React from 'react';
import { useLoaderData } from 'react-router';
import { profileLoader } from '../../loaders/user.loaders';
// import { loader } from '~/routes/public/user/profile';


const ProfilePage: React.FC = () => {
    console.log("PROFILE PAGE RENDERED!")
    // const data = useLoaderData<typeof loader>();
    // console.log(data?.data)
  return (
    // <div>{JSON.stringify(data)}</div>
    <></>
  )
}

export default ProfilePage