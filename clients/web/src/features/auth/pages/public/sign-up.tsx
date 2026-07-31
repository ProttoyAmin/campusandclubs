import React from "react";
import { useRegister } from "@/features/auth/hooks";
import type { RegisterRequestWritable } from "@campus/api";


const SignUp: React.FC = () => {
  const { mutate, isPending, isError, error } = useRegister();
  const [formData, setFormData] = React.useState<RegisterRequestWritable>({
    username: "newuser1",
    email: "prottoy.amin10615@gmail.com",
    password: "password@123",
    re_password: "password@123",
  });

  const handleSubmit = (formData: RegisterRequestWritable) => {
    console.log("CLICKED", formData);
    mutate(formData, {
      onSuccess: () => {
        console.log("Success");
      },
      onError: (error) => {
        console.log("Error:", error.response);
      },
    });
  };

  console.log("ERROR: ", error);
  return (
    <>
      <button onClick={(e) => handleSubmit(formData)} disabled={isPending}>Sign Up</button>
      {isError && (
        <ul>
          {Object.entries(error.response.data).map(([field, messages]) => (
            <li key={field}>
              {field}: {(messages as string[]).join(", ")}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SignUp;
