import ClubSettingsForm from "@/components/forms/club/club-settings";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useUpdateClub } from "@/features/club/hooks/club.hooks";
import { toast } from "design/components/ui/toast";
import type { ClubSettingsRequest } from "validation/club";
import NavTabs from "@/components/nav-tabs";
import { clubSettingsMenu } from "@/config/menu/club/club-settings";

const ClubSettingsPage = () => {
  const { club } = useClubOutlet();
  const { update } = useUpdateClub(club.slug);
  const updateSettings = update(club.id || '')
  const handleSubmit = (data: ClubSettingsRequest) => {
    console.log("Form submitted successfully:", data);

    updateSettings.mutate(data, {
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
    <div className="flex w-full justify-center">
      {/* <ClubSettingsForm onSubmit={handleSubmit} pending={updateSettings.isPending} /> */}
      <NavTabs
        menu={clubSettingsMenu(club.slug || '')}
        className="w-full"
        itemsClassName="justify-center flex-1"
        variant="tab"
      />
    </div>
  );
};

export default ClubSettingsPage;
