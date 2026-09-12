import type { MenuItemType } from "@/config/menu/main-menu";
import { unLink } from "@/utils/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import { toast } from "design/components/ui/toast";
import { InfoIcon, LinkIcon, CircleAlertIcon, LogOutIcon } from "lucide-react";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import AboutClub from "./about-club";
import React from "react";
import { useNavigate } from "react-router-dom";
import AppAlertDialog from "@/shared/components/alert";
import type { ClubDetail } from "@campus/api";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";

type DropDownProps = {
  trigger: React.ReactElement;
  menu?: () => MenuItemType[];
  onLeave: () => void;
  club: ClubDetail;
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
        <DropdownMenuGroup className={"w-full md:w-40 flex flex-col gap-2"}>
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
            className={"cursor-pointer p-2"}
          >
            <LinkIcon className="size-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAboutDialog(true)}
            variant="default"
            className={"cursor-pointer p-2"}
          >
            <InfoIcon className="size-4" />
            About this club
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { }}
            variant="destructive"
            className={"cursor-pointer p-2"}
          >
            <CircleAlertIcon className="size-4" />
            Report club
          </DropdownMenuItem>
          {props.club?.is_member && (
            <DropdownMenuItem
              onClick={() => setIsLeaving(true)}
              variant="destructive"
              className={"cursor-pointer p-2"}
            >
              <LogOutIcon className="size-4" />
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
      // title={`About ${props.club.name}`}
      // description={`Details about ${props.club.name}`}
      >
        <AboutClub club={props.club} />
      </ResponsiveDialog>
    </>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={props.trigger} />
      <DropdownMenuContent className={`w-fit`}>
        <DropdownMenuGroup className={"w-40 flex flex-col gap-2"}>
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
            className={"cursor-pointer p-2"}
          >
            <LinkIcon className="size-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAboutDialog(true)}
            variant="default"
            className={"cursor-pointer p-2"}
          >
            <InfoIcon className="size-4" />
            About this club
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { }}
            variant="destructive"
            className={"cursor-pointer p-2"}
          >
            <CircleAlertIcon className="size-4" />
            Report club
          </DropdownMenuItem>
          {props.club?.is_member && (
            <DropdownMenuItem
              onClick={() => setIsLeaving(true)}
              variant="destructive"
              className={"cursor-pointer p-2"}
            >
              <LogOutIcon className="size-4" />
              Leave
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
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
      // title={`About ${props.club.name}`}
      // description={`Details about ${props.club.name}`}
      >
        <AboutClub club={props.club} />
      </ResponsiveDialog>
    </DropdownMenu>
  );
};

export default ClubDropdown;
