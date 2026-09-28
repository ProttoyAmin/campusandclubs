import type { MenuItemType } from "@/config/menu/main-menu";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";
import { unLink } from "@/utils/link";
import type { UserProfile } from "@campus/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { toast } from "design/components/ui/toast";
import { InfoIcon, LinkIcon, BanIcon, CircleAlertIcon } from "lucide-react";

type DropDownProps = {
  trigger: React.ReactElement;
  menu?: () => MenuItemType[];
  user: UserProfile
};

import React from "react";
import { useNavigate } from "react-router-dom";
import AboutProfile from "./about-profile";

const ProfileDropdown = (props: DropDownProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.add({
      title: "Copied",
      description: window.location.href,
    });
  };

  return (
    <>
      <ResponsiveDropDownMenu trigger={props.trigger}>
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
            onClick={() => {
              setOpen(true);
            }}
            variant="default"
            className={"cursor-pointer p-2"}
          >
            <InfoIcon className="size-4" />
            About this profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { }}
            variant="destructive"
            className={"cursor-pointer p-2"}
          >
            <CircleAlertIcon className="size-4" />
            Report
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { }}
            variant="destructive"
            className={"cursor-pointer"}
          >
            <BanIcon className="size-4" />
            Block
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </ResponsiveDropDownMenu>
      <ResponsiveDialog
        showCloseButton={false}
        open={open}
        onOpenChange={setOpen}
      >
        <AboutProfile user={props.user} />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileDropdown;
