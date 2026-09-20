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
import { cn } from "design/lib/utils";


export type DialogProps = {
    trigger?: React.ReactElement;
    title?: string | React.ReactElement;
    description?: string | React.ReactElement;
    footer?: string | React.ReactElement;
    open?: boolean;
    showCloseButton?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
};

const dialogSizeMap: Record<NonNullable<DialogProps["size"]>, string> = {
    sm: "sm:max-w-sm h-[40vh]",
    md: "sm:max-w-xl h-[60vh]",
    lg: "sm:max-w-2xl h-[80vh]",
    xl: "sm:max-w-4xl h-[90vh]",
    full: "sm:max-w-[95vw] h-[95vh]",
};

const drawerSizeMap: Record<NonNullable<DialogProps["size"]>, string> = {
    sm: "h-[40vh]",
    md: "h-[60vh]",
    lg: "h-[80vh]",
    xl: "h-[90vh]",
    full: "h-[95vh]",
};


const ResponsiveDialog = (props: DialogProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    if (isDesktop) {
        return (
            <Dialog open={props.open} onOpenChange={props.onOpenChange}>
                {props.trigger && <DialogTrigger render={props.trigger}></DialogTrigger>}
                <DialogContent className={cn("bg-background", dialogSizeMap[props.size || ''])} showCloseButton={props.showCloseButton}>
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
            {props.trigger && <DrawerTrigger render={props.trigger}></DrawerTrigger>}
            <DrawerContent className={cn('bg-background border-t border-[#27272a]', drawerSizeMap[props.size || ''])}>
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