import { useClubOutlet } from "@/features/club/context/club-layout-context";

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
        <p>{club?.origin}</p>
      </div>
    </div>
  );
};

export default ClubInfoPage;
