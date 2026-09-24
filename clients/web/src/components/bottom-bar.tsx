import { useMe } from "@/features/user/hooks/user.hooks";
import NavTabs from "./nav-tabs";
import { MainMobileMenu, type MenuItemType } from "@/config/menu/main-mobile-menu";

interface BottomBarProps {
  className?: string;
}

const BottomBar: React.FC<BottomBarProps> = (props) => {
  const { data: currentUser } = useMe();

  return (
    <header className={`${props.className}`}>
      <NavTabs
        menu={MainMobileMenu(currentUser?.username || '')}
        className="flex flex-row md:flex-col self-start"
      />
    </header>
  );
};

export default BottomBar;
