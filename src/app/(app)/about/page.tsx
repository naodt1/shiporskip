export const metadata = { title: "About · ShipOrSkip" };

export default function AboutPage() {
  return (
    <div className="max-w-[560px]">
      <h1 className="m-0 mb-3 text-xl font-bold">About</h1>
      <p className="m-0 mb-3 text-pretty">
        ShipOrSkip helps indie hackers decide which unfinished side project to finish. Post 2–5 projects, other builders vote, and you get a clear answer with reasons.
      </p>
      <p className="m-0 mb-7 text-pretty">Posting and voting are free. Boosts put your campaign at the top of the feed.</p>
      <div className="flex items-center gap-3.5 rounded-[10px] border border-border bg-white p-3.5">
        <span className="h-12 w-12 shrink-0 rounded-full bg-fill" />
        <div className="flex min-w-0 flex-col">
          <span className="text-[13px] text-muted-3">Made by</span>
          <span className="font-semibold">Your Name</span>
          <a href="https://x.com/yourhandle" target="_blank" rel="noopener" className="text-sm text-green no-underline">
            @yourhandle
          </a>
        </div>
      </div>
    </div>
  );
}
