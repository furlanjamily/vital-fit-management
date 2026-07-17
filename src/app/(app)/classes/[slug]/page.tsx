import { ClassScheduleContent } from "@/components/classes/ClassScheduleContent";

type ClassPageProps = {
  params: Promise<{ slug: string }>;
};

/** Auth + Supabase cookies — must stay dynamic (no generateStaticParams). */
export const dynamic = "force-dynamic";

export default async function ClassPage({ params }: ClassPageProps) {
  const { slug } = await params;
  return <ClassScheduleContent slug={slug} />;
}
