import type { Metadata } from "next";
import { AddOnsView } from "./_components/addons-view";

export const metadata: Metadata = {
  title: "Add-ons",
};

export default function AddOnsPage() {
  return <AddOnsView />;
}
