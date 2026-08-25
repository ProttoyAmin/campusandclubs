// components/SocialLoginForms.tsx — rendered once, e.g. in your root auth layout
import { routes } from "@/settings/routes";

const PROVIDERS = ["google", "facebook", "github"] as const;
const ALLAUTH_BROWSER_PATH = "_allauth/browser/v1/";

export function SocialLoginForms() {
  return (
    <>
      {PROVIDERS.map((provider) => (
        <form
          key={provider}
          id={`social-login-form-${provider}`}
          method="POST"
          action={`/api/${ALLAUTH_BROWSER_PATH}auth/provider/redirect`}
          style={{ display: "none" }}
        >
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="process" value="login" />
          <input
            type="hidden"
            name="callback_url"
            value={`${window.location.origin}${routes.auth.public.social_callback}`}
          />
          <input type="hidden" name="csrfmiddlewaretoken" value="" />
        </form>
      ))}
    </>
  );
}