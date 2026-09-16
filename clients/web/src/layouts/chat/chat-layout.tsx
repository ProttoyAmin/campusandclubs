import React from 'react';
import { useSectionId } from '@/shared/hooks/id';
import { Outlet } from 'react-router-dom';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { HugeiconsIcon } from '@hugeicons/react';
import { MessageAdd02Icon } from '@hugeicons/core-free-icons';
import { Button } from 'design/components/ui/button';

const ChatLayout = () => {
    const sectionId = useSectionId("chat-layout-section", 20)
    const pageHeader = usePageHeader()

    return (
        <section id={sectionId} className='grid grid-cols-12 border min-h-[calc(100vh-1rem)]'>
            <div className='col-span-3 min-h-[calc(100vh-4rem)] p-4 border-r'>
                {pageHeader.actions ?? <div className='flex items-center justify-between'>
                    <p className='text-lg font-semibold'>Chats</p>
                    <Button size="icon-lg" variant="outline" className={"rounded-full"}><HugeiconsIcon icon={MessageAdd02Icon} className='size-5' /></Button>
                </div>}
            </div>
            <div className='col-span-9 min-h-[calc(100vh-4rem)] p-4'>
                <Outlet />
            </div>
        </section>
    )
}

export default ChatLayout