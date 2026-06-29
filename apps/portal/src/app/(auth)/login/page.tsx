import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
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
            Sign in to Blaxel
          </h1>
        </div>
        <LoginForm />
        <p className="text-center typography-caption text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
