import Image from "next/image";
import type { AssetImage } from "@/lib/types";

/**
 * An asset's photo, or a neutral placeholder when there isn't one yet.
 *
 * The placeholder is deliberate: a listing that shows an unrelated stock photo
 * is worse than one that shows none, because the whole pitch is that OPTS knows
 * exactly which unit it's selling. Better to say "no photo yet" than to imply
 * the wrong thing.
 */
export function AssetThumbnail({
  image,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  image?: AssetImage;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      {image ? (
        <Image src={image.url} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 17l4.5-4.5 3 3L15 12l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium">Photo coming soon</span>
        </div>
      )}
    </div>
  );
}
