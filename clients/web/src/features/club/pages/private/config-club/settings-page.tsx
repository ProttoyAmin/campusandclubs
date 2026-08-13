import ClubSettingsForm from "@/components/forms/club/club-settings";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useUpdateClub } from "@/features/club/hooks/club.hooks";
import { toast } from "design/components/ui/toast";
import type { ClubSettingsRequest } from "validation/club";

const ClubSettingsPage = () => {
  const { club } = useClubOutlet();
  const { update } = useUpdateClub(club.slug, club.id.toString());
  const handleSubmit = (data: ClubSettingsRequest) => {
    console.log("Form submitted successfully:", data);

    update.mutate(data, {
      onSuccess: () => {
        toast.add({
          title: "Club settings updated successfully",
          type: "success",
        });
      },
      onError: (error) => {
        toast.add({ title: error.response.data.detail, type: "error" });
      },
    });
  };

  return (
    <>
      <ClubSettingsForm onSubmit={handleSubmit} pending={update.isPending} />
    </>
  );
};

export default ClubSettingsPage;
