import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { userQueries } from "@/lib/query/user";
import { ProfileForm } from "./_components";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(userQueries.current());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileForm />
    </HydrationBoundary>
  );
}
