import type { MenuItemType } from "@/config/menu/main-menu";
import { ModeToggle } from "@/shared/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";

import React from "react";
import { useNavigate } from "react-router-dom";

type DropDownProps = {
  trigger: React.ReactElement;
  menu: () => MenuItemType[];
};

const SidebarDropDown = (props: DropDownProps) => {
  const navigate = useNavigate();
  console.log(props);

  const unLink = (item: MenuItemType["link"]) => {
    const link = typeof item === "function" ? item("") : item;
    return link;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={props.trigger} />
      <DropdownMenuContent className={`w-fit`}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className={'mb-2'}>
            <ModeToggle />
          </DropdownMenuLabel>
          {props.menu().map((item: MenuItemType) => (
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarDropDown;
