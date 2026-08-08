import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card";

import { useClubOutlet } from "../../context/club-layout-context";

const ClubPage: React.FC = () => {
  const { club } = useClubOutlet();


  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="relative">
          <img src={club?.banner || undefined} alt={club?.name || undefined} />
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute top-30 right-6 flex justify-center items-center shadow-md">
            <img
              src={club?.avatar || undefined}
              alt={club?.name || ""}
              className="w-32 h-32 object-cover rounded-md shadow-2xl"
            />
          </div>
        </div>
        <CardTitle className="flex justify-between mt-4">{club?.name}</CardTitle>
        <div className="flex gap-2 items-center">
          <CardDescription>{club?.about}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <pre>{JSON.stringify(club, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};

export default ClubPage;
