import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { LoginPolicyView } from "./_components/login-policy-view";

export const metadata: Metadata = {
  title: "Login policy",
};

export default async function LoginPolicyPage() {
  const session = await requireSession();
  const emailDomain = session.email.split("@")[1] ?? null;
  return <LoginPolicyView emailDomain={emailDomain} />;
}
