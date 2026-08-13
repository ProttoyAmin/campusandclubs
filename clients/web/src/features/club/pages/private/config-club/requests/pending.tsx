import { useClubRequestsOutlet } from "@/features/club/context/club-requests-context";
import type { ApplicationType } from "@/features/club/types/application";
import ApplicationCard from "@/features/club/components/club/application-card";
import { generateShortId } from "@/utils/id";

const ClubRequestsPendingView = () => {
  const { applications } = useClubRequestsOutlet();
  const pendings = applications?.filter(
    (application) => application.status === "pending",
  );
  return (
    <>
      {pendings?.length === 0 ? (
        <p className="text-center">No pending applications</p>
      ) : (
        pendings?.map((application) => (
          <div className="grid grid-cols-1 gap-4">
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

export default ClubRequestsPendingView;
