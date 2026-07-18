import { Skeleton, SkeletonGlassPanel } from "@/components/common/skeleton";

function FormFieldSkeleton() {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-3 w-24 rounded-md" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      className="flex flex-col pb-4"
      aria-busy="true"
      aria-label="Carregando perfil"
    >
      <header className="mb-6 shrink-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-14 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        <div className="flex flex-col items-center text-center">
          <Skeleton className="size-[82px] rounded-full ring-2 ring-white/10" />
          <Skeleton className="mt-3 h-4 w-36 rounded-md" />
          <Skeleton className="mt-2 h-3 w-24 rounded-md" />
        </div>
      </header>

      <SkeletonGlassPanel
        className="mb-6 rounded-2xl p-6"
        label="Carregando informações gerais"
      >
        <Skeleton className="mb-5 h-4 w-40 rounded-md" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className="mt-5 flex justify-end">
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </SkeletonGlassPanel>

      <SkeletonGlassPanel
        className="rounded-2xl p-6"
        label="Carregando alteração de senha"
      >
        <Skeleton className="mb-5 h-4 w-36 rounded-md" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className="mt-4 grid gap-1.5">
          <Skeleton className="h-3 w-32 rounded-md" />
          <Skeleton className="h-2.5 w-48 rounded-md" />
          <Skeleton className="h-2.5 w-44 rounded-md" />
          <Skeleton className="h-2.5 w-52 rounded-md" />
        </div>
        <div className="mt-5 flex justify-end">
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </SkeletonGlassPanel>
    </div>
  );
}
