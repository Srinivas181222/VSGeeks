export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-900/70 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-white">CodeLearn</div>
          <div>Build real skills with real tools.</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Support</span>
          <span>Careers</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
}
