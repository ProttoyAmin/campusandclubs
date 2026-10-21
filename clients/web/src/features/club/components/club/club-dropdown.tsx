import type { MenuItemType } from "@/config/menu/main-menu";
import { unLink } from "@/utils/link";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "design/components/ui/dropdown-menu";
import { toast } from "design/components/ui/toast";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import AboutClub from "./about-club";
import React from "react";
import { useNavigate } from "react-router-dom";
import AppAlertDialog from "@/shared/components/alert";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";
import type { ClubDetailExtended } from "../../http/club.http";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CopyLinkIcon, InfoIcon, LogOutIcon } from "@hugeicons/core-free-icons";

type DropDownProps = {
  trigger: React.ReactElement;
  menu?: () => MenuItemType[];
  onLeave: () => void;
  club: ClubDetailExtended;
  isMember: boolean;
};

const ClubDropdown = (props: DropDownProps) => {
  const [leaving, setIsLeaving] = React.useState(false);
  const [aboutDialog, setAboutDialog] = React.useState(false);
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate();

  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setOpen(false)
    toast.add({
      title: "Copied",
      description: window.location.href,
    });
  };

  return (
    <>
      <ResponsiveDropDownMenu
        trigger={props.trigger}
        open={open}
        onOpenChange={setOpen}
      >
        <DropdownMenuGroup className={"w-full flex flex-col gap-2"}>
          {props.menu &&
            props.menu().map((item: MenuItemType) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => {
                  navigate(unLink(item.link));
                }}
                className="cursor-pointer"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          <DropdownMenuItem
            onClick={() => onCopy()}
            variant="default"
            className={"cursor-pointer p-4"}
          >
            <HugeiconsIcon icon={CopyLinkIcon} className="size-5" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAboutDialog(true)}
            variant="default"
            className={"cursor-pointer p-4"}
          >
            <HugeiconsIcon icon={InfoIcon} className="size-5" />
            About this club
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { }}
            variant="destructive"
            className={"cursor-pointer p-4"}
          >
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5" />
            Report club
          </DropdownMenuItem>
          {props.club?.is_member && (
            <DropdownMenuItem
              onClick={() => setIsLeaving(true)}
              variant="destructive"
              className={"cursor-pointer p-4"}
            >
              <HugeiconsIcon icon={LogOutIcon} className="size-5" />
              Leave
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </ResponsiveDropDownMenu>
      <AppAlertDialog
        open={leaving}
        onOpenChange={setIsLeaving}
        title="Leave club"
        description="Are you sure you want to leave this club?"
        cancelText="Cancel"
        variant="destructive"
        confirmText="Leave"
        onCancel={() => setIsLeaving(false)}
        onConfirm={() => {
          props.onLeave();
          setIsLeaving(false);
        }}
      />
      <ResponsiveDialog
        open={aboutDialog}
        onOpenChange={setAboutDialog}
        trigger={null}
        showCloseButton={false}
      >
        <AboutClub club={props.club} />
      </ResponsiveDialog>
    </>
  )
};

export default ClubDropdown;
