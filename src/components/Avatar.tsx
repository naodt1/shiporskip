/* eslint-disable @next/next/no-img-element */
import { avatarColor, initial } from "@/lib/format";

export function Avatar({ handle, url, size = 22, ring, className = "" }: { handle: string; url?: string | null; size?: number; ring?: string; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45), ...(ring ? { border: `2px solid ${ring}` } : {}) };
  if (url) return <img src={url} alt="" title={"@" + handle} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span title={"@" + handle} style={{ ...style, background: avatarColor(handle) }} className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${className}`}>
      {initial(handle)}
    </span>
  );
}
