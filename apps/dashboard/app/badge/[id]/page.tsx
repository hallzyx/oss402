import { redirect } from "next/navigation";

export default async function BadgeLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/verify/${id}`);
}
