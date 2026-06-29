import type { Metadata } from "next";
import Link from "next/link";
import { BrandMarkSquare } from "@repo/ui/components/brand-mark";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[420px] rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <BrandMarkSquare size="sm" />
          <h1 className="typography-subtitle font-semibold text-foreground">
            Create your Blaxel account
          </h1>
        </div>
        <RegisterForm />
        <p className="text-center typography-caption text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
