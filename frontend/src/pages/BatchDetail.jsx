import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed";
import AddItemBar from "../components/AddItemBar";
import Header from "../components/Header";
import Participants from "../components/Participants";
import SummaryPanel from "../components/SummaryPanel";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";
import { getSocket } from "../services/socket";
import { buildBatchDashboard } from "../utils/batch";

const EMPTY_ITEM_FORM = {
  name: "",
  quantity: "1",
  price: "",
};

export default function BatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [values, setValues] = useState(EMPTY_ITEM_FORM);

  useEffect(() => {
    let active = true;

    async function loadBatch() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/batch/${id}`);

        if (active) {
          setBatch(response.data?.data || null);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load this batch."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBatch();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      socket.emit("batch:join", id);
    };

    const handleBatchUpdated = (payload) => {
      if (payload?.batchId !== id || !payload.batch) {
        return;
      }

      setBatch(payload.batch);
      setActionMessage(
        payload.eventType === "batch_closed"
          ? "Batch closed successfully."
          : payload.eventType === "item_added"
            ? "Batch updated live."
            : ""
      );
    };

    socket.on("connect", handleConnect);
    socket.on("batch:updated", handleBatchUpdated);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("batch:join", id);
    }

    return () => {
      socket.emit("batch:leave", id);
      socket.off("connect", handleConnect);
      socket.off("batch:updated", handleBatchUpdated);
    };
  }, [id]);

  useEffect(() => {
    if (!batch || batch.status === "CLOSED") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setBatch((current) => (current ? { ...current } : current));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [batch]);

  const summary = useMemo(() => {
    if (!batch) {
      return null;
    }

    return buildBatchDashboard(batch, user?.id);
  }, [batch, user?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    if (!batch || batch.status === "CLOSED") {
      return;
    }

    setError("");
    setActionMessage("");
    setIsSubmitting(true);

    try {
      const response = await api.post(`/batch/${id}/items`, {
        name: values.name.trim(),
        quantity: Number(values.quantity),
        price: Number(values.price),
      });

      setBatch(response.data?.data || batch);
      setValues(EMPTY_ITEM_FORM);
      setActionMessage("Item added successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to add this item."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseBatch = async () => {
    if (!batch || batch.status === "CLOSED") {
      return;
    }

    const confirmed = window.confirm("Close this batch and stop any more items from being added?");

    if (!confirmed) {
      return;
    }

    setError("");
    setActionMessage("");
    setIsClosing(true);

    try {
      const response = await api.patch(`/batch/${id}/close`);
      setBatch(response.data?.data || batch);
      setActionMessage("Batch closed successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to close this batch."));
    } finally {
      setIsClosing(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setActionMessage("Invite link copied.");
    } catch {
      setError("Unable to copy the invite link on this device.");
    }
  };

  if (loading) {
    return (
      <main className="app-shell">
        <div className="surface grid min-h-[70vh] place-items-center p-8">
          <div className="text-center">
            <p className="eyebrow">Loading batch</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Opening the order room...</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!batch || !summary) {
    return (
      <main className="app-shell">
        <div className="surface grid min-h-[70vh] place-items-center p-8">
          <div className="max-w-md text-center">
            <p className="eyebrow">Batch unavailable</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              This session could not be loaded.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {error || "The batch may no longer exist or the backend is not reachable."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell pb-28">
      {error ? (
        <div className="status-banner border-rose-400/20 bg-rose-400/10 text-rose-100">
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="status-banner border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
          {actionMessage}
        </div>
      ) : null}

      <Header
        batch={batch}
        summary={summary}
        inviteLink={window.location.href}
        onCopyInvite={handleCopyInvite}
        onCloseBatch={handleCloseBatch}
        isClosing={isClosing}
      />

      <div className="page-grid mt-6">
        <Participants participants={summary.participants} currentUserId={user?.id} />
        <ActivityFeed
          entries={summary.activityEntries}
          countdownLabel={summary.countdownLabel}
          status={batch.status}
        />
        <SummaryPanel summary={summary} batch={batch} />
      </div>

      <AddItemBar
        values={values}
        onChange={handleChange}
        onSubmit={handleAddItem}
        isSubmitting={isSubmitting}
        isClosed={batch.status === "CLOSED"}
      />
    </main>
  );
}
