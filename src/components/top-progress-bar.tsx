export function TopProgressBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-blue-100">
      <div className="dm-progress h-full w-2/5 rounded-r-full bg-[var(--brand-primary)]" />
    </div>
  )
}
