import React from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter
} from "design/components/ui/drawer"

interface AppDrawerProps {
    trigger: React.ReactElement;
    title?: string | React.ReactElement;
    description?: string | React.ReactElement;
    footer?: string | React.ReactElement;
    open?: boolean;
    showCloseButton?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const AppDrawer = ({ open, onOpenChange, trigger, children, title, description, footer }: AppDrawerProps) => {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} swipeDirection='left'>
            <DrawerTrigger render={trigger} />
            <DrawerContent className={'bg-background border-t border-[#27272a]'}>
                <DrawerHeader className="pb-4">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                {children}
                <DrawerFooter>
                    {footer}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default AppDrawer