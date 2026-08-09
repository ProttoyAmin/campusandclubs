import { Button } from "design/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NavigateButtons = ({ disableForward = false, hideForward = false }) => {
  const navigate = useNavigate();
  return (
    <>
      <Button
        variant="ghost"
        className={`
            rounded-full animate-[slideInLeft_0.3s_ease-out]
          `}
        size="icon"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="size-5" />
      </Button>
      {!hideForward && (
        <Button
          variant="ghost"
          disabled={disableForward}
          className={`rounded-full animate-[slideInRight_0.3s_ease-out]`}
          size="icon"
          onClick={() => navigate(+1)}
        >
          <ArrowRightIcon className="size-5" />
        </Button>
      )}
    </>
  );
};

export default NavigateButtons;
