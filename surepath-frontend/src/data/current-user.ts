import type { CurrentUser } from "@/types/user-types";

/** Fallback mock user until backend authentication exists. */
export const CURRENT_USER: CurrentUser = {
    username: "admin",
    context: "Admin · local",
    initial: "A",
};