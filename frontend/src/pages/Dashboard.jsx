import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BatchCard from "../components/BatchCard";
import CreateBatchModal from "../components/CreateBatchModal";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";
import { getSocket } from "../services/socket";
import { mapBatchCard } from "../utils/batch";
import { formatCurrency, toLocalDateTimeValue } from "../utils/formatters";

function createEmptyForm() {
  return {
    restaurantName: "",
    buildingId: "",
    expiresAt: toLocalDateTimeValue(),
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [batches, setBatches] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(() => createEmptyForm());

  useEffect(() => {
    let active = true;

    async function loadBatches() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/batch");
        const nextBatches = Array.isArray(response.data?.data) ? response.data.data : [];

        if (active) {
          setBatches(nextBatches);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load batches right now."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBatches();

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const socket = getSocket();

    const handleBatchesChanged = (payload) => {
      if (!payload?.batch) {
        return;
      }

      setBatches((current) => [
        payload.batch,
        ...current.filter((batch) => batch._id !== payload.batch._id),
      ]);
    };

    socket.on("batches:changed", handleBatchesChanged);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("batches:changed", handleBatchesChanged);
    };
  }, [user?.id]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const cards = useMemo(
    () => batches.map((batch) => mapBatchCard(batch, user?.id)),
    [batches, now, user?.id]
  );

  const totals = useMemo(() => {
    return cards.reduce(
      (accumulator, batch) => {
        if (batch.status === "LIVE") {
          accumulator.totalBatches += 1;
        }
        accumulator.totalPeople += batch.participantCount || 0;
        accumulator.totalItems += batch.itemCount || 0;
        accumulator.totalValue += batch.total || 0;
        return accumulator;
      },
      {
        totalBatches: 0,
        totalPeople: 0,
        totalItems: 0,
        totalValue: 0,
      }
    );
  }, [cards]);

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateBatch = async (event) => {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const response = await api.post("/batch/create", {
        restaurantName: createForm.restaurantName.trim(),
        buildingId: createForm.buildingId.trim(),
        expiresAt: new Date(createForm.expiresAt).toISOString(),
      });

      const nextBatch = response.data?.data;

      setCreateForm(createEmptyForm());
      setIsCreateOpen(false);

      if (nextBatch?._id) {
        navigate(`/batch/${nextBatch._id}`);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to create a batch."));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="app-shell">
      <CreateBatchModal
        isOpen={isCreateOpen}
        values={createForm}
        onChange={handleCreateFormChange}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateForm(createEmptyForm());
        }}
        onSubmit={handleCreateBatch}
        isSubmitting={isCreating}
      />

      <section className="surface overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <span className="pill border-cyan-300/30 text-cyan-100">Realtime batch control room</span>
            <p className="eyebrow mt-6">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              See every collaborative order from one place.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
              Open a batch, watch totals move, and jump into the order room the moment a team
              needs attention.
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="surface-soft flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-slate-400">Signed in as</p>
                <strong className="mt-1 block text-lg text-white">
                  {user?.name || user?.email || "Authenticated user"}
                </strong>
              </div>
              <button type="button" className="btn-secondary" onClick={logout}>
                Log out
              </button>
            </div>

            <button type="button" className="btn-primary" onClick={() => setIsCreateOpen(true)}>
              Create New Batch
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="metric-tile">
            <p className="text-sm text-slate-400">Open rooms</p>
            <strong className="mt-2 block text-3xl font-semibold text-white">
              {totals.totalBatches}
            </strong>
          </article>
          <article className="metric-tile">
            <p className="text-sm text-slate-400">Participants tracked</p>
            <strong className="mt-2 block text-3xl font-semibold text-white">
              {totals.totalPeople}
            </strong>
          </article>
          <article className="metric-tile">
            <p className="text-sm text-slate-400">Items across rooms</p>
            <strong className="mt-2 block text-3xl font-semibold text-white">
              {totals.totalItems}
            </strong>
          </article>
          <article className="metric-tile bg-white/[0.08]">
            <p className="text-sm text-slate-400">Tracked value</p>
            <strong className="mt-2 block text-3xl font-semibold text-white">
              {formatCurrency(totals.totalValue)}
            </strong>
          </article>
        </div>
      </section>

      {error ? (
        <div className="status-banner mt-6 border-rose-400/20 bg-rose-400/10 text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="mt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Live sessions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">All batches</h2>
          </div>
          <span className="pill">{loading ? "Syncing..." : "Backend connected"}</span>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface h-72 animate-pulse bg-white/[0.04]" />
            ))}
          </div>
        ) : cards.length ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {cards.map((batch, index) => (
              <BatchCard key={batch.id} batch={batch} index={index} />
            ))}
          </div>
        ) : (
          <div className="surface grid min-h-[360px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <p className="eyebrow">No batches yet</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                Start the first shared order room.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Create a batch from the dashboard and invite others to begin adding items live.
              </p>
              <button
                type="button"
                className="btn-primary mt-6"
                onClick={() => setIsCreateOpen(true)}
              >
                Launch a Batch
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
