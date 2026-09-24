import React from 'react';
import { useMediaQuery } from '../hooks/use-media-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "design/components/ui/drawer";

type DropDownProps = {
    trigger: React.ReactElement;
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
};

const ResponsiveDropDownMenu = (props: DropDownProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <>
                <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
                    <DropdownMenuTrigger render={props.trigger}></DropdownMenuTrigger>
                    <DropdownMenuContent className={'w-45'} align='end'>
                        {props.children}
                    </DropdownMenuContent>
                </DropdownMenu>

            </>
        )
    }

    return (
        <>
            <Drawer open={props.open} onOpenChange={props.onOpenChange} showSwipeHandle>
                <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
                    <DrawerTrigger render={props.trigger}></DrawerTrigger>
                    <DrawerContent className={'bg-background border-t border-[#27272a]'}>
                        {props.children}
                    </DrawerContent>
                </DropdownMenu>
            </Drawer>
            {/* <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
                <DropdownMenuTrigger render={props.trigger}></DropdownMenuTrigger>
                <DropdownMenuContent className={'w-fit'} align='end'>
                    {props.children}
                </DropdownMenuContent>
            </DropdownMenu> */}
        </>
    )
}

export default ResponsiveDropDownMenu