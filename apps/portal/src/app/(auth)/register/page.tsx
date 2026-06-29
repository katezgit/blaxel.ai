import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[420px] rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center overflow-hidden"
          >
            <Image
              src="/blaxel-logo.svg"
              alt=""
              width={98}
              height={28}
              priority
              className="h-7 w-auto max-w-none dark:hidden"
            />
            <Image
              src="/blaxel-logo-dark.svg"
              alt=""
              width={98}
              height={28}
              priority
              className="hidden h-7 w-auto max-w-none dark:block"
            />
          </span>
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
