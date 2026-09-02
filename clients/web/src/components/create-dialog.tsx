import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "design/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "design/components/ui/avatar";
import { type DialogProps } from "@/shared/components/app-dialog";
import { Button } from "design/components/ui/button";
import { CircleEllipsisIcon } from "lucide-react";
import type { UserProfile } from "@campus/api";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue
} from 'design/components/ui/combobox';
import { ChevronRightIcon } from "lucide-react"
import PostCreateForm from "./forms/post/create-post";
import React from "react";
import type { PostCreateInput } from "validation/post";

type CreateDialogProps = {
  user: Pick<UserProfile, "username" | "avatar">;
  options: Omit<DialogProps, "children">,
}

export function CreateDialog({ user, options }: CreateDialogProps) {
  const [value, setValue] = React.useState<string[]>([]);
  const images = [
    {
      name: "workspace.png",
      meta: "PNG · 820 KB",
      src: "https://www.wallsnapy.com/img_gallery/goku-ssb-dragon-ball-super-cool-hd-wallpaper-483116.jpg",
      alt: "Workspace",
    },
    {
      name: "desk-reference.jpg",
      meta: "JPG · 1.1 MB",
      src: "https://www.superherotoystore.com/cdn/shop/articles/e33c2fa94c03efa06678116f80d62d0d_1c4bccf2-0e38-4f4c-8dcd-f51830857d15_708x.jpg?v=1757494254",
      alt: "Desk",
    }
  ]

  const handleSubmit = (data: PostCreateInput) => {
    const payload = {
      ...data,
      clubId: value.length > 0 ? value[0] : undefined
    }

    console.log("submit", payload);
  }

  const clubs = [
    {
      id: "club1",
      label: "Computer club",
    },
    {
      id: "club2",
      label: "English Club",
    },
    {
      id: "club3",
      label: "Photography Club",
    },
    {
      id: "club4",
      label: "Drama Club",
    },
    {
      id: "club5",
      label: "Music Club",
    },
  ]
  return (
    <Dialog>
      <DialogTrigger render={options.trigger} />
      <DialogContent className={"bg-[#181818]"} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <DialogClose render={<Button variant={"outline"} className={'rounded-full'}>Cancel</Button>} />
              <span className="font-semibold">New Post</span>
              <Button variant={"ghost"} className={'rounded-full'}><CircleEllipsisIcon className="size-6" /></Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="-mx-4 flex flex-col gap-2 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <div className="flex gap-2 items-center">
            <Avatar size="lg">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-base">
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            <ChevronRightIcon className="size-4 text-gray-400" />
            <Combobox
              items={clubs}
              multiple
              value={value}
              onValueChange={(v) => {
                console.log(v);
                setValue(v);
              }}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {value.map((id) => {
                    const club = clubs.find((club) => club.id === id);

                    if (!club) return null;

                    return (
                      <ComboboxChip key={club.id}>
                        {club.label}
                      </ComboboxChip>
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
                    <ComboboxItem
                      key={item.id}
                      value={item.id}
                    >
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <PostCreateForm user={{ username: user?.username, avatar: user?.avatar }} onSubmit={handleSubmit} />
        </div>
        <DialogFooter>
          <Button type="submit" form="post-create-form" variant={"outline"} size={"lg"} className="shadow-2xl w-full">Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
