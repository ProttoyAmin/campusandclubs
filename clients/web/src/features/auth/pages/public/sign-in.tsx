import React from 'react';
import { useLogin } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';


const SignIn: React.FC = () => {
    const { mutate, isPending, isError, error } = useLogin();
    const navigate = useNavigate();
    


    const handleSignIn = () => {
        mutate({ username_or_email: "prottoy", password: "12345" }, {
          onSuccess: () => {
            navigate("/");
          },
          onError: (error) => {
            console.log("Error:", error.response);
          },
        });
    };

  return (
    <div>
      <button onClick={handleSignIn} disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>
      {isError && 
        <ul>{Object.entries(error.response.data).map(([field, messages]) => (
          <li key={field}>
            {field}: {(messages as string[]).join(", ")}
          </li>
        ))}</ul>
      }
    </div>
  )
}

export default SignIn