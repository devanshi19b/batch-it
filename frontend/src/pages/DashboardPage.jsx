import {
  ArrowRight,
  Boxes,
  Plus,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import BatchCard from "../components/BatchCard";
import EmptyState from "../components/EmptyState";
import { BatchCardSkeleton } from "../components/LoadingSkeleton";
import { useAuth } from "../hooks/useAuth";
import { useBatchesFeed } from "../hooks/useBatchSocket";
import { useToast } from "../hooks/useToast";
import { fetchBatches } from "../services/batchService";
import { extractErrorMessage } from "../services/api";
import { calculateBatchMetrics } from "../utils/batch";
import { formatCurrency } from "../utils/format";

export default function DashboardPage() {
  const { session } = useAuth();
  const { pushToast } = useToast();
  const [batches, setBatches] = useState([]);
  const [source, setSource] = useState("backend");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const loadBatches = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await fetchBatches(session);

        startTransition(() => {
          setBatches(result.data);
          setSource(result.source);
        });

        setError("");
      } catch (loadError) {
        setError(extractErrorMessage(loadError, "Unable to load batches."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useBatchesFeed({
    enabled: source === "backend" && session?.provider !== "demo",
    onChange: async () => {
      await loadBatches({ silent: true });
    },
  });

  const filteredBatches = batches.filter((batch) => {
    if (!deferredSearch) {
      return true;
    }

    return [batch.restaurantName, batch.buildingId, batch.initiator?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredSearch);
  });

  const summary = batches.reduce(
    (accumulator, batch) => {
      const metrics = calculateBatchMetrics(batch);

      accumulator.totalAmount += metrics.totalAmount;
      accumulator.totalItems += metrics.totalItems;

      if (batch.status === "LIVE") {
        accumulator.liveCount += 1;
      }

      return accumulator;
    },
    { totalAmount: 0, totalItems: 0, liveCount: 0 }
  );

  useEffect(() => {
    if (!refreshing) {
      return;
    }

    pushToast({
      title: "Workspace refreshed",
      description: "Batch updates just landed from the live board.",
      tone: "info",
      duration: 2200,
    });
  }, [refreshing, pushToast]);

  return (
    <div className="space-y-8">
      <section className="glass-panel-strong relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-8">
        <div className="ambient-orb right-[-2rem] top-[-3rem] h-40 w-40 bg-cyan-300/16" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              <Sparkles size={14} />
              Batch intelligence
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Shared ordering that looks and feels under control.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
              Track every live batch, jump into detail instantly, and keep team
              contributions visible before closeout.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                className="input-shell !rounded-full !pl-11"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search restaurant, building, or owner"
                value={search}
              />
            </div>
            <Link className="button-primary" to="/batches/new">
              <Plus size={18} />
              Create batch
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: Boxes,
            label: "Active batches",
            value: summary.liveCount,
          },
          {
            icon: Wallet,
            label: "Tracked spend",
            value: formatCurrency(summary.totalAmount),
          },
          {
            icon: ArrowRight,
            label: "Items in motion",
            value: summary.totalItems,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div className="glass-panel rounded-[28px] p-6" key={label}>
            <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/18 bg-cyan-300/10 p-3 text-cyan-100">
              <Icon size={18} />
            </div>
            <p className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      {source === "demo" ? (
        <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-50">
          Demo mode is active. Batch data is being served from local fallback
          storage so the UI stays usable even if the backend is offline.
        </div>
      ) : null}

      {error && !loading ? (
        <EmptyState
          action={
            <button className="button-primary" onClick={() => loadBatches()} type="button">
              Try again
            </button>
          }
          description={error}
          icon={Boxes}
          title="Unable to load batches"
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <BatchCardSkeleton key={index} />
            ))
          : filteredBatches.map((batch) => <BatchCard batch={batch} key={batch._id} />)}
      </section>

      {!loading && !filteredBatches.length && !error ? (
        <EmptyState
          action={
            <Link className="button-primary" to="/batches/new">
              Create the first batch
            </Link>
          }
          description="No batches match this filter yet. Start a new ordering window and invite the team in."
          icon={Boxes}
          title="Nothing on the board"
        />
      ) : null}
    </div>
  );
}
