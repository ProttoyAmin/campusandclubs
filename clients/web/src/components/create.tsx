import { ChevronRightIcon, CircleEllipsisIcon, PlusIcon } from "lucide-react";
import { Button } from "design/components/ui/button";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { useMe, useProfile } from "@/features/user/hooks/user.hooks";
import { DialogClose } from "design/components/ui/dialog";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "design/components/ui/combobox";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "design/components/ui/avatar";
import React from "react";
import PostCreateForm from "./forms/post/create-post";
import type { PostCreateInput } from "validation/post";
import { usePosts } from "@/features/posts/hooks/posts.hooks";
import { toast } from "design/components/ui/toast";
import { Spinner } from "design/components/ui/spinner";
import { queryClient } from "@/config/query-client";

const Create = () => {
  const { data: user } = useMe();
  const { clubs } = useProfile();
  const { create } = usePosts();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [value, setValue] = React.useState<string[]>([]);

  const handleSubmit = (data: PostCreateInput) => {
    const payload = {
      ...data,
      clubs: value.length > 0 ? value[0] : undefined,
    };

    console.log("submit", payload);
    create.mutate(payload, {
      onSuccess() {
        toast.add({
          title: "Post created successfully",
          type: "success",
        });
        setDialogOpen(false);
        setValue([]);
        queryClient.invalidateQueries({ queryKey: ["user", user.username, "posts"] });
      },
      onError(error: any) {
        console.log(error.response.data);
        toast.add({
          title: "Failed to create post",
          description: error.response.data.detail.message,
          type: "error",
        });
      },
    });
  };

  const clubOptions = clubs.data?.map((club) => ({
    id: club.id,
    label: club.name,
  }));
  return (
    <>
      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={
          <Button variant={"outline"} size={"icon-lg"} className={"shadow-2xl"}>
            <PlusIcon className="size-5" />
          </Button>
        }
        title={
          <div className="flex items-center justify-between">
            <DialogClose
              render={
                <Button variant={"outline"} className={"rounded-full"}>
                  Cancel
                </Button>
              }
            />
            <h1 className="font-semibold text-base">New Post</h1>
            <Button variant={"ghost"} className={"rounded-full"}>
              <CircleEllipsisIcon className="size-6" />
            </Button>
          </div>
        }
        footer={
          <Button
            type="submit"
            form="post-create-form"
            variant={"outline"}
            size={"lg"}
            disabled={create.isPending}
            className="shadow-2xl w-full"
          >
            {create.isPending ? <><Spinner /> Posting...</> : "Post"}
          </Button>
        }
        showCloseButton={false}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center px-4">
            <Avatar size="lg">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-base">
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            <ChevronRightIcon className="size-4 text-gray-400" />
            <Combobox
              items={clubOptions}
              multiple
              value={value}
              onValueChange={(v) => {
                setValue(v);
              }}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {value.map((id) => {
                    const club = clubOptions.find((club) => club.id === id);

                    if (!club) return null;

                    return (
                      <ComboboxChip key={club.id}>{club.label}</ComboboxChip>
                    );
                  })}
                </ComboboxValue>

                <ComboboxChipsInput
                  placeholder={value.length === 0 ? "Club" : ""}
                  className="border-none focus:outline-none focus-visible:ring-transparent"
                />
              </ComboboxChips>

              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>

                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item.id}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex flex-col gap-2 no-scrollbar overflow-y-auto px-4">
            <PostCreateForm
              user={{ username: user?.username, avatar: user?.avatar }}
              onSubmit={handleSubmit}
              isPending={create.isPending}
            />

          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
};

export default Create;
