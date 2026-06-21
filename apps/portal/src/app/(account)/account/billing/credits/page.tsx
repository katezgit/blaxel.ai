import type { Metadata } from "next";
import CreditsView from "./_components/credits-view";

export const metadata: Metadata = {
  title: "Credits & funding",
};

export default function CreditsPage() {
  return <CreditsView />;
}
