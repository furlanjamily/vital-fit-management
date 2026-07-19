type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="Vital Fit">
      <span className="brand-wordmark-script">Vital</span>
      <span className="brand-wordmark-sans">Fit</span>
    </span>
  );
}
