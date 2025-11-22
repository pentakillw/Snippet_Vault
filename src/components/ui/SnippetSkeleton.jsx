export default function SnippetSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden h-full flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-main)]/30">
        <div className="flex justify-between items-start mb-3">
           <div className="flex gap-2">
              <div className="h-5 w-16 bg-[var(--border)] rounded-md" />
              <div className="h-5 w-16 bg-[var(--border)] rounded-md opacity-50" />
           </div>
           <div className="flex gap-1">
              <div className="h-8 w-8 bg-[var(--border)] rounded-lg" />
              <div className="h-8 w-8 bg-[var(--border)] rounded-lg" />
           </div>
        </div>
        <div className="h-6 w-3/4 bg-[var(--border)] rounded-md mb-2" />
        <div className="flex gap-2">
           <div className="h-4 w-12 bg-[var(--border)] rounded-md" />
           <div className="h-4 w-12 bg-[var(--border)] rounded-md" />
        </div>
      </div>
      
      {/* Code Body Skeleton */}
      <div className="flex-grow bg-[var(--bg-card)] p-4 space-y-2">
         <div className="h-3 w-full bg-[var(--border)]/50 rounded" />
         <div className="h-3 w-5/6 bg-[var(--border)]/50 rounded" />
         <div className="h-3 w-4/6 bg-[var(--border)]/50 rounded" />
         <div className="h-3 w-full bg-[var(--border)]/50 rounded" />
      </div>

      {/* Footer Skeleton */}
      <div className="p-3 border-t border-[var(--border)] flex justify-between items-center">
         <div className="h-3 w-20 bg-[var(--border)] rounded" />
         <div className="h-8 w-20 bg-[var(--border)] rounded-lg" />
      </div>
    </div>
  );
}