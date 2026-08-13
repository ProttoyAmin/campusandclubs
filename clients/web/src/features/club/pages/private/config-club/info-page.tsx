import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { Badge } from "lucide-react";

const ClubInfoPage = () => {
  const { club } = useClubOutlet();

  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <h1>{club?.name}</h1>
          <p>{club?.about}</p>
        </div>
      </div>
      <div>
        <p>{club?.status}</p>
        <Badge>{club?.category}</Badge>
      </div>
    </div>
  );
};

export default ClubInfoPage;
