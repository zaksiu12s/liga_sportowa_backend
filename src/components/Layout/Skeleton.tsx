interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={`bg-gray-100 animate-pulse ${className} dark:bg-neutral-900`} />
  );
};
