import type { Route } from "../../../routes/public/user/+types/profile";

import { account } from "../services/user.service";

export async function usersLoader() {
    console.log("usersLoader");
  return account.users();
}

export async function profileLoader({ params }: Route.LoaderArgs) {
    console.log("profileLoader", params);
    return account.profile(params.username);
}