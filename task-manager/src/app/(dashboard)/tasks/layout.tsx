import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return <>{children}</>;
}
