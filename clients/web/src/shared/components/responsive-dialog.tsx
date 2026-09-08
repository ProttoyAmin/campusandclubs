import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "design/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter
} from "design/components/ui/drawer"
import { useMediaQuery } from "../hooks/use-media-query";


export type DialogProps = {
    trigger: React.ReactElement;
    title?: string | React.ReactElement;
    description?: string | React.ReactElement;
    footer?: string | React.ReactElement;
    open?: boolean;
    showCloseButton?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};


const ResponsiveDialog = (props: DialogProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    if (isDesktop) {
        return (
            <Dialog open={props.open} onOpenChange={props.onOpenChange}>
                <DialogTrigger render={props.trigger}></DialogTrigger>
                <DialogContent className={'bg-background w-content'} showCloseButton={props.showCloseButton}>
                    {props.title || props.description ? (
                        <DialogHeader>
                            {props.title && <DialogTitle>{props.title}</DialogTitle>}
                            {props.description && <DialogDescription>{props.description}</DialogDescription>}
                        </DialogHeader>
                    ) : null}
                    {props.children}
                    {props.footer && (
                        <DialogFooter>
                            {props.footer}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        )
    };
    return (
        <Drawer open={props.open} onOpenChange={props.onOpenChange} showSwipeHandle>
            <DrawerTrigger render={props.trigger}></DrawerTrigger>
            <DrawerContent className={'bg-background border-t border-[#27272a]'}>
                {props.title || props.description ? (
                    <DrawerHeader className="pb-4">
                        {props.title && <DrawerTitle>{props.title}</DrawerTitle>}
                        {props.description && <DrawerDescription>{props.description}</DrawerDescription>}
                    </DrawerHeader>
                ) : null}
                <div className="p-4">
                    {props.children}
                </div>
                {props.footer && (
                    <DrawerFooter>
                        {props.footer}
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
}

export default ResponsiveDialog