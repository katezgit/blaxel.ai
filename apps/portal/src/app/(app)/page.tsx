import { redirect } from "next/navigation";
import { DEFAULT_WORKSPACE_SLUG } from "@/lib/mock/org";

export default function AppRootRedirect() {
  redirect(`/${DEFAULT_WORKSPACE_SLUG}/sandboxes`);
}
