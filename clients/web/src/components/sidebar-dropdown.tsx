import type { MenuItemType } from "@/config/menu/main-menu";
import { LogoutAlertDialog } from "@/features/auth/components/logout-dialog";
import { ModeToggle } from "@/shared/components/mode-toggle";
import { unLink } from "@/utils/link";
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
  const [logoutAlertModal, setLogoutAlertModal] = React.useState(false);

  return (
    <>
      <LogoutAlertDialog
        open={logoutAlertModal}
        onOpenChange={setLogoutAlertModal}
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={props.trigger} />
        <DropdownMenuContent className={`w-fit`}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className={"mb-2"}>
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
            <DropdownMenuItem
              onClick={() => setLogoutAlertModal(true)}
              variant="destructive"
              className={"cursor-pointer"}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SidebarDropDown;
