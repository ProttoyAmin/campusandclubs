import { useClubRequestsOutlet } from "@/features/club/context/club-requests-context";
import ApplicationCard from "@/features/club/components/club/application-card";
import type { ApplicationType } from "@/features/club/types/application";

const ClubRequestsPage = () => {
  const { applications } = useClubRequestsOutlet();

  return (
    <div className="flex flex-col gap-4 w-full">
      {applications?.map((application) => (
        <div key={application.id} className="grid grid-cols-1">
          <ApplicationCard
            application={application as unknown as ApplicationType}
          />
        </div>
      ))}
    </div>
  );
};

export default ClubRequestsPage;
