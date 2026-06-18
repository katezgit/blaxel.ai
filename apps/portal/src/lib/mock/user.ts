import { currentUser } from "@/lib/mock/data";
import type { User } from "@/lib/mock/types";

export async function fetchCurrentUser(): Promise<User> {
  return { ...currentUser };
}
