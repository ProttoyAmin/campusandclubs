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
import { InfoIcon, LinkIcon, BanIcon, CircleAlertIcon } from "lucide-react";

type DropDownProps = {
  trigger: React.ReactElement;
  menu?: () => MenuItemType[];
};

import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = (props: DropDownProps) => {
  const navigate = useNavigate();

  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.add({
      title: "Copied",
      description: window.location.href,
    });
  };

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
            onClick={() => {}}
            variant="default"
            className={"cursor-pointer p-2"}
          >
            <InfoIcon className="size-4" />
            About this profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {}}
            variant="destructive"
            className={"cursor-pointer p-2"}
          >
            <CircleAlertIcon className="size-4" />
            Report
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {}}
            variant="destructive"
            className={"cursor-pointer"}
          >
            <BanIcon className="size-4" />
            Block
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
