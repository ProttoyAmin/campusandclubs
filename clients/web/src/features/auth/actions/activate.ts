import {authentication} from "@/features/auth/services/authentication/index"
import type { ActivationRequest } from "@campus/api";

export const activate = (data: ActivationRequest) => authentication.activate(data);
