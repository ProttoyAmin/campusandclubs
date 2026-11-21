
import NavTabs from '@/components/nav-tabs';
import { AccountPrivacyMenu } from '@/config/menu/user/privacy-menu';
import PrivacySwitch from '@/features/user/components/profile-settings/privacy-switch';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { CardContent } from 'design/components/ui/card';
import React from 'react';
import Menu from '@/shared/components/menu';

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
    <Menu
      items={AccountPrivacyMenu()}
    />
  )
}

export default UserPrivacyPage