import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import type { ReactNode } from "react";

interface OverviewCardProps {
  title: string;
  children: ReactNode;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

/**
 * Billing overview card shell — title row, free-form content, primary +
 * optional secondary CTA in the footer. Footer placement matches the
 * "answer first, action second" reading order specified for the landing.
 */
export default function OverviewCard({
  title,
  children,
  primaryCta,
  secondaryCta,
  className,
}: OverviewCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">{children}</CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button asChild variant="primary">
          <Link href={primaryCta.href}>
            {primaryCta.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        {secondaryCta ? (
          <Button asChild variant="secondary">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
