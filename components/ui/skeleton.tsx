import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton-shimmer bg-foreground/6 rounded-md", className)}
      {...props}
    />
  )
}

/** Wrap a group of skeletons so screen readers announce a single "Loading". */
function SkeletonGroup({
  className,
  label = "Loading",
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export { Skeleton, SkeletonGroup }
