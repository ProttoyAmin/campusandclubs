import React from 'react';
import { Outlet } from 'react-router-dom';
import { useParams } from 'react-router-dom';


export const ClubMainLayout: React.FC = () => {
    const { slug } = useParams()

    React.useEffect(() => {
      document.title = `${slug} - Club`;
    }, [slug]);
    
  return (
    <div>
      <Outlet context={slug}/>
    </div>
  )
}

export default ClubMainLayout