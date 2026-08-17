import { CardContent } from "design/components/ui/card";
import { useAccount, useEmails } from "@/features/user/hooks/user.hooks";
import { Button } from "design/components/ui/button";
import { Plus, Trash } from "lucide-react";
import AppDialog from "@/shared/components/app-dialog";
import { Input } from "design/components/ui/input";
import { toast } from "design/components/ui/toast";
import { useState } from "react";
import { Spinner } from "design/components/ui/spinner";
import { Badge } from "design/components/ui/badge";

const UserAccountPage = () => {
  const { data: emails } = useEmails();
  const { addEmail } = useAccount();
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleAddEmail = async (email: string) => {
    addEmail.mutate(email, {
      onSuccess: () => {
        toast.add({
          title: "Email added successfully",
          timeout: 5000,
          type: "success",
        });
      },
      onError: (error) => {
        toast.add({
          title: "Failed to add email",
          description:
            error.response.data.errors?.[0]?.message ||
            "Please try again later",
          timeout: 5000,
          type: "error",
        });
      },
    });

    setOpen(false);
    setEmail("");
  };

  const handleMakePrimary = (email: string) => {
    console.log("primary making", email);
  };

  return (
    <CardContent className="flex flex-col gap-4">
      {emails?.map((email) => {
        return (
          <div key={email.id} className="border p-2 rounded-md">
            <div className="flex flex-col gap-1">
              <h1 className="text-muted-foreground">{email.email}</h1>
              <Badge
                variant={email.verified ? "default" : "secondary"}
                className={`w-fit ${
                  email.verified ? "bg-blue-900 text-white" : "bg-orange-900"
                }`}
              >
                {email.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center justify-end gap-2">
              {!email.primary && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={email.primary}
                  onClick={() => handleMakePrimary(email.email)}
                >
                  Make Primary
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => console.log("trashed", email.email)}
              >
                <Trash />
              </Button>
            </div>
          </div>
        );
      })}
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button>
            <Plus /> Add Email
          </Button>
        }
        title="Add Email"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddEmail(email);
          }}
          className="flex items-center gap-3"
        >
          <Input
            type="email"
            value={email}
            required
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            disabled={addEmail.isPending}
          >
            {addEmail.isPending ? <Spinner /> : <Plus />}
          </Button>
        </form>
      </AppDialog>
    </CardContent>
  );
};

export default UserAccountPage;
