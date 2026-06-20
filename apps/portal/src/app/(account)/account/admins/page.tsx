import type { Metadata } from "next";
import { AdminsClient } from "./_components/admins-client";

export const metadata: Metadata = {
  title: "Admins",
};

export default function AdminsPage() {
  return (
    <div className="page-shell">
      <AdminsClient />
    </div>
  );
}
