import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import React from 'react'

const BlockedUsers = () => {
    const pageHeader = usePageHeader()

    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons
                        hideForward
                    />
                    <h1 className="text-lg font-semibold">Blocked Users</h1>
                </div>
            </>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);
    return (
        <div>BlockedUsers</div>
    )
}

export default BlockedUsers