import React from 'react';
import { useOutletContext } from 'react-router-dom';

const ClubPage: React.FC = () => {
  const slug = useOutletContext<string>();
  return (
    <div>{slug}</div>
  )
}

export default ClubPage
