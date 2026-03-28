import Link from "next/link";

interface ExperienceCardProps {
  title: string;
  description: string;
  href: string;
  availability: string;
  locked?: boolean;
}

export function ExperienceCard({
  title,
  description,
  href,
  availability,
  locked = false,
}: ExperienceCardProps) {
  const body = (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">World Labs</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{description}</p>
      <p className="mt-4 text-xs font-medium text-white/80">{availability}</p>
    </article>
  );

  if (locked) return <div className="opacity-65">{body}</div>;
  return <Link href={href}>{body}</Link>;
}
