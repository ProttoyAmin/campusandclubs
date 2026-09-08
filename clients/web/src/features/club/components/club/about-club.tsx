import type { ClubDetail } from '@campus/api';
import DummyImage from "@/assets/570b6554a692c0e846848347ac0c3db6.jpg"
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';

const AboutClub = ({ club }: { club: ClubDetail }) => {
    return (
        <div className=''>
            {/* <pre>{JSON.stringify(club, null, 2)}</pre> */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Name</p>
                    <p className='text-sm text-muted-foreground'>{club?.name}</p>
                </div>
                <Avatar size="2xl">
                    <AvatarImage src={club?.avatar || DummyImage} />
                    <AvatarFallback>{club?.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>

            <div className="flex items-center justify-between mt-8">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Origin</p>
                    <p className='text-sm text-muted-foreground'>{club?.origin ? club?.origin : "Local"}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Since</p>
                    <p className='text-sm text-muted-foreground'>{new Date(club?.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            <div className="flex items-center mt-8">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Owner</p>
                    <p className='text-sm text-muted-foreground'>@{club?.owner_details?.username}</p>
                </div>
                <Avatar size="lg">
                    <AvatarImage src={club?.owner_details?.profile_picture} />
                    <AvatarFallback>{club?.owner_details?.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>

        </div>
    )
}

export default AboutClub