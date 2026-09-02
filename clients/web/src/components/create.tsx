import { PlusIcon } from "lucide-react";
import { Button } from "design/components/ui/button";
import { CreateDialog } from "./create-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card"
import { useMe } from "@/features/user/hooks/user.hooks";

const Create = () => {
  const { data: user } = useMe();
  return (
    <>
      <CreateDialog
        user={{
          username: user?.username,
          avatar: user?.avatar,
        }}
        options={{
          trigger: (
            <Button variant={"outline"} size={"icon-lg"} className={"shadow-2xl"}>
              <PlusIcon className="size-5" />
            </Button>
          ),
        }}
      />
    </>
  );
};

export default Create;
