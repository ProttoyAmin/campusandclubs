import React from 'react';
import type { MenuItemType } from "@/config/menu/main-menu";
import NavTabs from '@/components/nav-tabs';

interface Props {
    items: MenuItemType[]
}

const Menu = (props: Props) => {
    return (
        <NavTabs menu={props.items} />
    )
}

export default Menu