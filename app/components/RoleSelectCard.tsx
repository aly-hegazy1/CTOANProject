interface RoleSelectCardProps {
  title: string
  description: string
  href: string
  icon: string
  tag?: string
}

export default function RoleSelectCard({ title, description, href, icon, tag }: RoleSelectCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{icon}</span>
        {tag && (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
            {tag}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-[var(--accent)] group-hover:underline">Enter →</span>
    </a>
  )
}
