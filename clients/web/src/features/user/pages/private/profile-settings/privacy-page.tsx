
import NavTabs from '@/components/nav-tabs';
import { AccountPrivacyMenu } from '@/config/menu/user/privacy-menu';
import PrivacySwitch from '@/features/user/components/profile-settings/privacy-switch';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { CardContent } from 'design/components/ui/card';
import React from 'react';


const UserPrivacyPage = () => {
  const pageHeader = usePageHeader()

  React.useEffect(() => {
    const id = pageHeader.push(
      <>
        <div className="flex items-center gap-4">
          <NavigateButtons
            hideForward
          />
          <h1 className="text-lg font-semibold">Privacy & Security</h1>
        </div>
      </>
    );

    return () => {
      pageHeader.pop(id)
    };
  }, [pageHeader.push, pageHeader.pop]);


  return (
    // <CardContent>
    //   <PrivacySwitch />
    // </CardContent>
    <NavTabs
      menu={AccountPrivacyMenu()}
      className="w-full"
      itemsClassName="justify-center flex-1"
      variant="tab"
    />
  )
}

export default UserPrivacyPage