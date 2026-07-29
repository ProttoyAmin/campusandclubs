import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { useGetClubs } from '@/features/club/hooks/club.hooks';

const ClubPage: React.FC = () => {
  const slug = useOutletContext<string>();
  

  console.log("RENDERED")
  const { data } = useGetClubs();
  console.log('data', data)
  return (
    <>
    
    <div>{slug}</div>
    {/* <div>{clubs?.name || 'No club found'}</div> */}
    </>
  )
}

export default ClubPage
