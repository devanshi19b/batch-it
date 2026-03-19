import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { getSocket } from "../services/socket";

const FALLBACK_BATCHES = [
  {
    _id: "4821",
    restaurantName: "Theory Cafe",
    title: "Friday Sprint Feast",
    members: 4,
    items: 5,
    total: 1055,
    timeLeft: "18:24",
    mood: "Ordering now",
  },
  {
    _id: "1942",
    restaurantName: "Late Night Republic",
    title: "Studio Fuel Run",
    members: 6,
    items: 9,
    total: 1840,
    timeLeft: "07:52",
    mood: "Almost closing",
  },
  {
    _id: "6508",
    restaurantName: "House of Dimsums",
    title: "Design Review Lunch",
    members: 3,
    items: 4,
    total: 920,
    timeLeft: "22:10",
    mood: "Fresh batch",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCountdown(expiresAt) {
  if (!expiresAt) {
    return "No timer";
  }

  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function mapBatchToCard(batch) {
  const items = Array.isArray(batch.items) ? batch.items : [];
  const total = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const participantIds = new Set();

  if (batch.initiator?.id || batch.initiator) {
    participantIds.add(batch.initiator?.id || batch.initiator);
  }

  items.forEach((item) => {
    const userId = item.user?.id || item.user;
    if (userId) {
      participantIds.add(userId);
    }
  });

  const countdown = formatCountdown(batch.expiresAt);
  const isClosed = batch.status === "CLOSED";
  const mood = isClosed
    ? "Closed"
    : countdown === "00:00"
      ? "Closing now"
      : participantIds.size > 3
        ? "Group ordering live"
        : "Open session";

  return {
    _id: batch._id,
    restaurantName: batch.restaurantName,
    title: batch.buildingId ? `${batch.restaurantName} • ${batch.buildingId}` : `${batch.restaurantName} Session`,
    members: participantIds.size,
    items: itemCount,
    total,
    timeLeft: isClosed ? "Closed" : countdown,
    mood,
    status: batch.status,
  };
}

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    API.get("/batch")
      .then((res) => {
        if (!isMounted) {
          return;
        }

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const mappedBatches = data.map(mapBatchToCard);
        setBatches(mappedBatches);
        setUsingFallback(mappedBatches.length === 0);
        if (mappedBatches.length === 0) {
          setBatches(FALLBACK_BATCHES);
        }
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUsingFallback(true);
        setBatches(FALLBACK_BATCHES);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleBatchesChanged = (payload) => {
      if (!payload?.batch) {
        return;
      }

      const mappedBatch = mapBatchToCard(payload.batch);
      setUsingFallback(false);
      setBatches((current) => {
        const next = [mappedBatch, ...current.filter((batch) => batch._id !== mappedBatch._id)];
        return next;
      });
    };

    socket.on("batches:changed", handleBatchesChanged);

    return () => {
      socket.off("batches:changed", handleBatchesChanged);
    };
  }, []);

  const summary = useMemo(() => {
    return batches.reduce(
      (accumulator, batch) => {
        accumulator.totalMembers += batch.members ?? 0;
        accumulator.totalItems += batch.items ?? 0;
        accumulator.totalSpend += batch.total ?? 0;
        return accumulator;
      },
      { totalMembers: 0, totalItems: 0, totalSpend: 0 }
    );
  }, [batches]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <span className="live-pill">Batch control room</span>
            <p className="eyebrow">Shared ordering overview</p>
            <h1>See every live group order in one place.</h1>
            <p className="dashboard-lead">
              Open active sessions, watch totals rise, and jump directly into the
              collaboration flow when a batch needs attention.
            </p>
          </div>

          <div className="dashboard-actions">
            <button type="button" className="ghost-button">
              Join Existing Batch
            </button>
            <button type="button" className="primary-button">
              Create Batch
            </button>
          </div>
        </header>

        <section className="dashboard-summary-grid">
          <article className="metric-card">
            <span>Open batches</span>
            <strong>{batches.length}</strong>
          </article>
          <article className="metric-card">
            <span>People collaborating</span>
            <strong>{summary.totalMembers}</strong>
          </article>
          <article className="metric-card metric-card--accent">
            <span>Tracked order value</span>
            <strong>{formatCurrency(summary.totalSpend)}</strong>
          </article>
          <article className="metric-card">
            <span>Items across sessions</span>
            <strong>{summary.totalItems}</strong>
          </article>
        </section>

        <section className="dashboard-list-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live sessions</p>
              <h2>Active batches</h2>
            </div>
            <span className={`panel-badge ${usingFallback ? "panel-badge--live" : ""}`}>
              {loading ? "Loading..." : usingFallback ? "Demo data" : "Backend synced"}
            </span>
          </div>

          <div className="dashboard-batch-list">
              {batches.map((batch, index) => (
                <Link
                  key={batch._id}
                  className="dashboard-batch-card"
                  to={`/batch/${batch._id}`}
                  style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="dashboard-batch-head">
                  <div>
                    <p className="item-category">{batch.restaurantName}</p>
                    <h3>{batch.title ?? `${batch.restaurantName} Session`}</h3>
                  </div>
                  <span
                    className={`panel-badge ${
                      batch.status === "CLOSED" ? "panel-badge--closed" : "panel-badge--live"
                    }`}
                  >
                    {batch.timeLeft ?? "Live"}
                  </span>
                </div>

                <div className="dashboard-batch-meta">
                  <span>{batch.members ?? 0} members</span>
                  <span>{batch.items ?? 0} items</span>
                  <span>{formatCurrency(batch.total ?? 0)}</span>
                </div>

                <div className="dashboard-batch-footer">
                  <strong>{batch.mood ?? "Active now"}</strong>
                  <span>Open workspace</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
