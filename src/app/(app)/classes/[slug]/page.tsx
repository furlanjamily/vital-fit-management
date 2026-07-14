import { ClassScheduleContent } from "@/components/classes/ClassScheduleContent";
import { classNameToSlug } from "@/lib/class-slug";
import { createClient } from "@/lib/supabase/server";
import { listScheduledClasses } from "@/services/class-manager";

type ClassPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const classes = await listScheduledClasses(supabase);

    return classes.map((item) => ({
      slug: classNameToSlug(item.name),
    }));
  } catch {
    return [];
  }
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { slug } = await params;
  return <ClassScheduleContent slug={slug} />;
}
