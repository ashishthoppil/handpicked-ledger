export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 hidden h-9 w-48 rounded-lg bg-line/70 md:block" />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="h-[74px] rounded-2xl bg-line/50" />
        <div className="h-[74px] rounded-2xl bg-line/50" />
      </div>
      <div className="mb-4 h-11 rounded-xl bg-line/50" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-line/40 md:h-14" />
        ))}
      </div>
    </div>
  );
}
