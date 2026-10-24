import {
  Boxes,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Discover Products", icon: Search, active: true },
];

export default function Sidebar({ onNewSearch }) {
  return (
    <aside className="flex h-full w-full flex-col bg-slate-950 text-slate-300 lg:w-64">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
          <Boxes size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            SupplyMind
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent sourcing
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              onClick={label === "Discover Products" ? onNewSearch : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                active
                  ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
            <Sparkles size={18} />
          </div>

          <p className="text-sm font-semibold text-white">
            Smarter sourcing
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Find relevant suppliers with a guided AI search.
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Settings size={18} />
          Settings
        </button>

        <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
            S
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Sourcing workspace
            </p>
            <p className="text-xs text-slate-500">Buyer account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}