
import ClubApplicationForm from "@/components/forms/club/apply-club";
import type { UserProfile } from "@campus/api";
import { useApplyToClub } from "../../hooks/club.hooks";
import { useParams } from "react-router-dom";
import { toast } from "design/components/ui/toast";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { useApplication } from "../../hooks/applications.hooks";
import React, { useState } from "react";
import type { ApplicationCreateRequest, ClubDetailExtended } from "../../http/club.http";
import { useMe } from "@/features/user/hooks/user.hooks";

export const useCacheAffiliations = () => {
  const { data } = useMe();
  const user = data as UserProfile

  return user?.affiliations ?? [];
};

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  clubId?: string;
  club: Pick<ClubDetailExtended, "name" | "origin" | "scope" | "join_mode">;
};

export function ClubApplicationDialog({
  open,
  onOpenChange,
  title,
  description,
  clubId,
  club,
}: DialogProps) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState<{ question_id: string, answer: string }[]>([])
  const { slug } = useParams();
  const { mutate: applyToClub } = useApplyToClub(clubId || "", slug || "");
  const { applicationForms } = useApplication(clubId);
  const affiliations = useCacheAffiliations()
  let isAffiliated = false

  React.useEffect(() => {
    if (applicationForms.data) {
      setQuestions(applicationForms.data.questions);
    }
  }, [applicationForms.data]);

  const renderContent = () => {
    if (club?.scope === "exclusive" && club.origin && affiliations.length !== 0) {
      isAffiliated = !!affiliations.find((a) => a.institute.id === club.origin?.id)

      if (isAffiliated) {
        return <ClubApplicationForm onSubmit={onSubmit} questions={questions} setAnswers={setAnswers} />
      } else {
        return (
          <>
            <p className="text-muted-foreground">This club is only taking submissions from {club?.origin?.name}. You can't apply for a membership here unless someone invites you for it. GET LOST!</p>
          </>
        )
      }
    }

    if (club?.scope === "exclusive" && affiliations.length === 0) {
      return <p className="text-muted-foreground">This club is only taking submissions from {club?.origin?.name}. You can't apply for a membership here unless someone invites you for it. GET LOST!</p>
    }

    if (club?.scope === "cross_institute" && affiliations.length === 0) {
      return <p className="text-orange-400">This is an Intra-affiliation club. You can apply for a membership once you claim your affiliation from settings.</p>
    }

    return <ClubApplicationForm onSubmit={onSubmit} questions={questions} setAnswers={setAnswers} />
  }

  const onSubmit = (data: ApplicationCreateRequest) => {

    const payload = {
      message: data.message,
      answers: answers
    }
    applyToClub(payload, {
      onSuccess: (id) => {
        onOpenChange(false);
        toast.add({
          title: "Application submitted",
          description: "Your application has been submitted successfully.",
          actionProps: {
            children: "Undo",
            onClick() {
              toast.close(id);
            },
          },
        });
      },
      onError: (error) => {
        onOpenChange(false);
        toast.add({
          title: "Failed",
          // @ts-ignore: Types not matching
          description: error?.response?.data?.detail || "Something went wrong"
        })
      }
    });
  };
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} trigger={<></>} title={title} description={description}>
      {renderContent()}
    </ResponsiveDialog>
  );
}
