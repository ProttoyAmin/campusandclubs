import FluidTabs from "design/components/animata/fluid-tabs";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type AppFluidTabsProps = {
    tabs: {
        label: string;
        to: string;
        icon?: React.ReactNode;
    }[];
};

const AppFluidTabs = ({ tabs }: AppFluidTabsProps) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Longest matching route wins, so "/" doesn't match everything
    const activeIndex = React.useMemo(() => {
        let best = -1;
        let bestLen = -1;
        tabs.forEach((tab, i) => {
            const match =
                tab.to === "/"
                    ? pathname === "/"
                    : pathname === tab.to || pathname.startsWith(tab.to + "/");
            if (match && tab.to.length > bestLen) {
                best = i;
                bestLen = tab.to.length;
            }
        });
        return Math.max(best, 0);
    }, [pathname, tabs]);

    const handleChange = React.useCallback(
        (index: number) => {
            const to = tabs[index]?.to;
            if (to && to !== pathname) navigate(to);
        },
        [tabs, pathname, navigate]
    );

    return (
        <FluidTabs activeIndex={activeIndex} onActiveIndexChange={handleChange}>
            <FluidTabs.List className="bg-foreground/5">
                {tabs.map((tab) => (
                    <FluidTabs.Tab key={tab.to} label={tab.label}>
                        {tab.icon && <FluidTabs.Icon>{tab.icon}</FluidTabs.Icon>}
                        <FluidTabs.Label>{tab.label}</FluidTabs.Label>
                    </FluidTabs.Tab>
                ))}
            </FluidTabs.List>
        </FluidTabs>
    );
};

export default React.memo(AppFluidTabs);