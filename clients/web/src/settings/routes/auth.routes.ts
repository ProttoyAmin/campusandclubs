export const authRoutes = {
  public: {
    sign_in: "/@/auth/sign-in",
    sign_up: "/@/auth/sign-up",
  },
  private: {
    activation: "/activate/:uuid/:token",
    forgot_password: "/@/auth/forgot-password",
    reset_password: "/@/auth/account/reset-password/:key",
    verify_email: "/@/auth/account/verify-email/:key",
  },
};
