import { PlusIcon } from "lucide-react";
import { Button } from "design/components/ui/button";
import { CreateDialog } from "./create-dialog";

const Create = () => {
  return (
    <CreateDialog
      trigger={
        <Button variant={"outline"} size={"icon-lg"} className={"shadow-2xl"}>
          <PlusIcon className="size-5" />
        </Button>
      }
      title="Create post"
    />
  );
};

export default Create;
