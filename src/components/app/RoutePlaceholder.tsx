type RoutePlaceholderProps = {
  title: string;
};

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
    </div>
  );
}
