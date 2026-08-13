import { useMe } from "@/features/user/hooks/user.hooks";
import { NavLink } from "react-router-dom";

interface BottomBarProps {
  className?: string;
}

const BottomBar: React.FC<BottomBarProps> = (props) => {
  const { data: currentUser } = useMe();

  const tabs = [
    { id: 1, to: "/", label: "Home", icon: "Home" },
    { id: 2, to: "/discover", label: "Discover", icon: "Search" },
    { id: 3, to: "/notifications", label: "Notifications", icon: "Bell" },
    {
      id: 4,
      to: `/@/u/${currentUser?.username}`,
      label: "Profile",
      icon: "User",
    },
  ];

  return (
    <div
      className={`${props.className} bg-background w-full p-2 flex justify-center`}
    >
      <div className="flex flex-row items-center justify-between w-full">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            className="flex flex-col space-y-2 self-start"
          >
            {tab.icon}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
