import React from "react";
import { useRegister } from "@/features/auth/hooks";
import type { RegisterWritable } from "@campus/api";

const SignUp: React.FC = () => {
  const { mutate, isPending, isError, error } = useRegister();

  const handleSubmit = (formData: RegisterWritable) => {
    console.log("CLICKED")
    mutate(formData);
  };

  console.log("ERROR: ", error);
  return (
    <>
    <button type="submit" onClick={() => handleSubmit({ username: "test", password: "test", email: "test", re_password: "test" })} disabled={isPending}>
      {isPending ? "Signing up..." : "Sign Up"}
    </button>
    <p>{isError &&
        <ul>
          {Object.entries(error.response.data).map(([field, messages]) => (
            <li key={field}>
              {field}: {(messages as string[]).join(", ")}
            </li>
          ))}
        </ul>
        }</p>
    </>
  );
};

export default SignUp;
