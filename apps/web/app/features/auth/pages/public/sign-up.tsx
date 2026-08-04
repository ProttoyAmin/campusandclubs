import type { RegisterRequestWritable } from "@campus/api";
import React from "react";
import { Link } from "react-router";
import { useRegister } from "../../hooks/auth.hooks";
import { Button } from "ui/components/ui/button";

const SignUpPage: React.FC = () => {
  const { mutate, isPending, isError, error } = useRegister();

  const handleSubmit = (formData: RegisterRequestWritable) => {
    console.log("CLICKED");
    mutate(formData);
  };
  return (
    <div>
      <Button
        type="submit"
        onClick={() =>
          handleSubmit({
            username: "test",
            password: "test",
            email: "test",
            re_password: "test",
          })
        }
        disabled={isPending}
      >
        {isPending ? "Signing up..." : "Sign Up"}
      </Button>
        {/* {isError && (
          <ul>
            {Object.entries(error.response?.data).map(([field, messages]) => (
              <li key={field}>
                {field}: {(messages as string[]).join(", ")}
              </li>
            ))}
          </ul>
        )} */}
    </div>
  );
};

export default SignUpPage;
