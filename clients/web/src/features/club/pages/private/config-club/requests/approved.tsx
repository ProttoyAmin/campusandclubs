import ApplicationCard from "@/features/club/components/club/application-card";
import { useClubRequestsOutlet } from "@/features/club/context/club-requests-context";
import type { ApplicationType } from "@/features/club/types/application";
import { generateShortId } from "@/utils/id";
import { useComponentId } from "@/shared/hooks/id";

const ClubRequestApprovePage = () => {
  const { applications } = useClubRequestsOutlet();
  const approved = applications?.filter(
    (application) => application.status === "approved",
  );
  return (
    <>
      {approved?.length === 0 ? (
        <p className="text-center">No approved applications</p>
      ) : (
        approved?.map((application) => (
          <div className="grid grid-cols-1 gap-4">
            <ApplicationCard
              key={useComponentId("application", "approved")}
              application={application as unknown as ApplicationType}
            />
          </div>
        ))
      )}
    </>
  );
};

export default ClubRequestApprovePage;
