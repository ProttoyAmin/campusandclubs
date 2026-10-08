import PrivacySwitch from '@/features/user/components/profile-settings/privacy-switch';
import { useSettingsOutlet } from '@/features/user/context/user-layout-context';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import React from 'react'

const AccountPrivacy = () => {
    const { me } = useSettingsOutlet();
    const [isPrivate, setIsPrivate] = React.useState<boolean>(me.is_private);
    const pageHeader = usePageHeader()

    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons
                        hideForward
                    />
                    <h1 className="text-lg font-semibold">Private Profile</h1>
                </div>
            </>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);



    return (
        <div className='space-y-4'>
            <PrivacySwitch
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
            />
        </div>
    )
}

export default AccountPrivacy