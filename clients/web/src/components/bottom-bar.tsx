import { useMe } from "@/features/user/hooks/user.hooks";
import NavTabs from "./nav-tabs";
import { MainMobileMenu } from "@/config/menu/main-mobile-menu";
interface BottomBarProps {
  className?: string;
}

const BottomBar: React.FC<BottomBarProps> = (props) => {
  const { data: currentUser } = useMe();

  return (
    <header className={`${props.className}`}>
      <NavTabs
        menu={MainMobileMenu(currentUser?.username || '')}
        className="flex w-full justify-center"
        itemsClassName="justify-center flex-1"
        variant="tab"
        onlyIcon
      />
    </header>
  );
};

export default BottomBar;
