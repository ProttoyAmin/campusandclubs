import { useClubOutlet } from '@/features/club/context/club-layout-context';
import { useClubInfo } from '@/features/club/hooks/club.hooks';
import { useIsMobile } from 'design/hooks/use-mobile';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const RoleDetails = () => {
    const navigate = useNavigate()
    const isMobile = useIsMobile();
    const { club } = useClubOutlet();
    const { getRoles } = useClubInfo(club.slug);

    return (
        <div>RoleDetails</div>
    )
}

export default RoleDetails