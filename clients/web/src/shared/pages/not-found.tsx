import { useNavigate } from "react-router-dom";
import { Button } from "design/components/ui/button";
import { ArrowLeft, House } from "lucide-react";
import { paths } from "@/settings/routes";


const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center max-w-md space-y-6">
        <div className="space-y-2">
          {/* <h1 className="text-6xl font-extrabold ">404</h1> */}
          <h2 className="text-5xl font-semibold">
            Page <span className="line-through">not</span> found
          </h2>
          <p className="text-muted-foreground">
            kire koi geli pailam na to... Sorry, the page you are looking for
            doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => navigate(paths.public.home)}
            className="flex items-center gap-2"
          >
            <House className="h-4 w-4" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
