// import { useQuery } from "@tanstack/react-query";
// import { authentication } from "../services/authentication";

// export const authKeys = {
//   session: ["auth", "session"] as const,
// };

// export const useSession = () => {
//   return useQuery({
//     queryKey: authKeys.session,
//     queryFn: () => authentication.checkSession(),
//     staleTime: 1000 * 60 * 5, // 5 min, tune to your access token lifetime
//     retry: false,
//   });
// };