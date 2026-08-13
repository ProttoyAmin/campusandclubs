import { useClubRequestsOutlet } from "@/features/club/context/club-requests-context";
import type { ApplicationType } from "@/features/club/types/application";
import ApplicationCard from "@/features/club/components/club/application-card";
import { generateShortId } from "@/utils/id";

const ClubRequestsRejectedView = () => {
  const { applications } = useClubRequestsOutlet();
  const rejected = applications?.filter(
    (application) => application.status === "rejected",
  );
  return (
    <>
      {rejected?.length === 0 ? (
        <p className="text-center">No rejected applications</p>
      ) : (
        rejected?.map((application) => (
          <div className="grid grid-cols-1">
            <ApplicationCard
              key={generateShortId()}
              application={application as unknown as ApplicationType}
            />
          </div>
        ))
      )}
    </>
  );
};

export default ClubRequestsRejectedView;
