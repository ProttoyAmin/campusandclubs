import type { UserProfile } from '@campus/api';
import DummyImage from "@/assets/570b6554a692c0e846848347ac0c3db6.jpg"
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';

const AboutProfile = ({ user }: { user: UserProfile }) => {
    return (
        <div className=''>
            {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Name</p>
                    <p className='text-sm text-muted-foreground'>{`${user.first_name} ${user.last_name} (@${user.username})`}</p>
                </div>
                <Avatar size="2xl">
                    {/* @ts-ignore */}
                    <AvatarImage src={user?.avatar || user?.profile_picture || DummyImage} />
                    <AvatarFallback>{user?.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>

            <div className="flex items-center justify-between mt-8">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Affiliation</p>
                    {/* @ts-ignore  */}
                    <p className='text-sm text-muted-foreground'>{user.affiliations.length > 0 ? user.affiliations[0].institute.name : "N/A"}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8">
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-sm">Joined</p>
                    <p className='text-sm text-muted-foreground'>{new Date(user?.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            {/* <div className="flex items-center mt-8">
                <div className="flex flex-col gap-2 border-b w-full">
                    <p className="text-sm">Owner</p>
                    <p className='text-sm text-muted-foreground'>@{club?.owner_details?.username}</p>
                </div>
                <Avatar size="lg">
                    <AvatarImage src={club?.owner_details?.avatar || club?.owner_details?.profile_picture || undefined} />
                    <AvatarFallback>{club?.owner_details?.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </div> */}

        </div>
    )
}

export default AboutProfile;