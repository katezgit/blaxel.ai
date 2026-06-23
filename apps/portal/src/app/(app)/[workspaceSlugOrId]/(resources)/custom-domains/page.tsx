import type { Metadata } from "next";
import CustomDomainsView from "./_components/custom-domains-view";

export const metadata: Metadata = {
  title: "Custom domains",
};

export default function CustomDomainsPage() {
  return <CustomDomainsView />;
}
