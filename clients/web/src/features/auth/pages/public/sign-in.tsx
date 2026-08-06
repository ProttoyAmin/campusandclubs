import React from "react";
import { useLogin } from "@/features/auth/hooks";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import { Button } from "design/components/ui/button";

type dummyForm = {
  username_or_email: string;
  password: string;
};

const SignIn: React.FC = () => {
  const { mutate, isPending, isError, error } = useLogin();
  const navigate = useNavigate();
  const [formInputs, setFormInputs] = React.useState<dummyForm>({
    username_or_email: "prottoy",
    password: "12345",
  });

  const handleSignIn = async (data: dummyForm) => {
    console.log(data);
    mutate(data, {
      onSuccess: () => {
        // navigate(paths.public.home);
        console.log("success");
      },
      onError: (error) => {
        console.log("Error:", error.response);
      },
    });
  };

  return (
    <div>
      {isError && (
        <ul>
          {Object.entries(error.response.data).map(([field, messages]) => (
            <li key={field}>
              {field}: {(messages as string[]).join(", ")}
            </li>
          ))}
        </ul>
      )}
      <form
        className=""
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn(formInputs);
        }}
      >
        <label htmlFor="">Username or Email</label>
        <input
          type="text"
          name="username_or_email"
          id="username_or_email"
          defaultValue={formInputs.username_or_email}
          onChange={(e) => {
            setFormInputs((prev) => ({
              ...prev,
              username_or_email: e.target.value,
            }))
          }}
        />
        <label htmlFor="">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) => {
            setFormInputs((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }}
        />
        <Button
          type="submit"
          disabled={isPending}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
