// Plain GET form — no client JS needed, works via the URL (?q=...) so
// results are server-filtered and the search stays bookmarkable/shareable.
// `extra` renders additional fields (e.g. a status <select>) inside the
// same form, before the submit button.
export default function SystemSearchBar({
  action,
  q,
  placeholder,
  extra,
  hasFilter
}: {
  action: string;
  q?: string;
  placeholder: string;
  extra?: React.ReactNode;
  hasFilter?: boolean;
}) {
  return (
    <form method="GET" action={action} className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="label">بحث</label>
        <input className="input" type="text" name="q" defaultValue={q ?? ""} placeholder={placeholder} />
      </div>
      {extra}
      <button type="submit" className="btn-secondary py-2 px-4 text-sm">
        بحث
      </button>
      {(hasFilter ?? Boolean(q)) && (
        <a href={action} className="text-sm text-ink-800/60 hover:underline">
          مسح البحث
        </a>
      )}
    </form>
  );
}
