import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card";

import { useClub } from "@/features/club/hooks/club.hooks";

const ClubPage: React.FC = () => {
  const slug = useOutletContext<string>();

  const { data } = useClub(slug);

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex justify-between ">{slug}</CardTitle>
        <div className="flex gap-2 items-center">
          <CardDescription>{data?.about}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};

export default ClubPage;
