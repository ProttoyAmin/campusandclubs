import React from 'react';
import { useLogin } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/settings/routes';


const SignIn: React.FC = () => {
    const { mutate, isPending, isError, error } = useLogin();
    const navigate = useNavigate();
    


    const handleSignIn = async () => {
        mutate({ username_or_email: "prottoy", password: "12345" }, {
          onSuccess: () => {
            navigate(paths.public.home);
            console.log('success')
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