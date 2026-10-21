import type { ResetPasswordSchemaType } from "validation/auth";
import ResetPasswordForm from "../../components/forms/reset-password";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks";

const ResetPasswordPage = () => {
  const { key } = useParams();
  const { resetPassword } = useAuth();
  console.log(key);

  const handleSubmit = (data: ResetPasswordSchemaType) => {
    console.log(data);
    console.log(key);

    const body = {
      key: key,
      password: data.password,
    };

    resetPassword.mutate(
      {
        key: key,
        new_password: body.password,
      },
      {
        onError: (error) => {
          console.log(error);
        },
      },
    );
  };

  return (
    <ResetPasswordForm
      onSubmit={handleSubmit}
      pending={resetPassword.isPending}
      serverErrors={resetPassword.error?.response.data}
    />
  );
};

export default ResetPasswordPage;
