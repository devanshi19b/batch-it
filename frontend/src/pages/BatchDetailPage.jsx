import {
  CircleSlash2,
  Clock3,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed";
import AddItemComposer from "../components/AddItemComposer";
import BatchItemList from "../components/BatchItemList";
import EmptyState from "../components/EmptyState";
import { PanelSkeleton } from "../components/LoadingSkeleton";
import StatusBadge from "../components/StatusBadge";
import SummaryPanel from "../components/SummaryPanel";
import UserListPanel from "../components/UserListPanel";
import { useAuth } from "../hooks/useAuth";
import { useBatchRoom } from "../hooks/useBatchSocket";
import { useToast } from "../hooks/useToast";
import {
  addItemToBatch,
  removeItemFromBatch,
  closeBatch,
  fetchBatchById,
  fetchBatchSummary,
} from "../services/batchService";
import { extractErrorMessage } from "../services/api";
import { buildBatchSummary, getEntityId } from "../utils/batch";
import { formatDateTime, getTimeRemaining } from "../utils/format";

const eventCopy = {
  item_added: "A new item was added to the batch.",
  item_removed: "An item was removed from the batch.",
  batch_closed: "The batch was closed.",
  batch_created: "The batch was created.",
};

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const { session, user } = useAuth();
  const { pushToast } = useToast();
  const [batch, setBatch] = useState(null);
  const [summary, setSummary] = useState(null);
  const [source, setSource] = useState("backend");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBatch = useCallback(async () => {
    setLoading(true);

    try {
      const [batchResult, summaryResult] = await Promise.all([
        fetchBatchById(batchId, session),
        fetchBatchSummary(batchId, session),
      ]);

      startTransition(() => {
        setBatch(batchResult.data);
        setSummary(summaryResult.data);
        setSource(batchResult.source);
      });

      setError("");
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load this batch."));
    } finally {
      setLoading(false);
    }
  }, [batchId, session]);

  useEffect(() => {
    void loadBatch();
  }, [loadBatch]);

  useBatchRoom({
    batchId,
    enabled: source === "backend" && session?.provider !== "demo",
    onUpdate: (payload) => {
      if (!payload?.batch) {
        return;
      }

      setBatch(payload.batch);
      setSummary(buildBatchSummary(payload.batch));
      pushToast({
        title: "Live update",
        description: eventCopy[payload.eventType] || "This batch changed.",
        tone: "info",
        duration: 2400,
      });
    },
  });

  const handleAddItem = async (payload) => {
    setActionLoading(true);

    try {
      const result = await addItemToBatch(batchId, payload, session);
      setBatch(result.data);
      setSource(result.source);
      const nextSummary = await fetchBatchSummary(batchId, {
        ...session,
        provider: result.source === "demo" ? "demo" : session?.provider,
      });
      setSummary(nextSummary.data);

      pushToast({
        title: "Item added",
        description:
          result.source === "backend"
            ? "The batch feed was updated for everyone."
            : "Added inside local demo mode.",
        tone: result.source === "backend" ? "success" : "warning",
      });
    } catch (submitError) {
      pushToast({
        title: "Unable to add item",
        description: extractErrorMessage(submitError, "Try again in a moment."),
        tone: "error",
      });
      throw submitError;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setActionLoading(true);

    try {
      const result = await removeItemFromBatch(batchId, itemId, session);
      setBatch(result.data);
      setSource(result.source);
      setSummary(buildBatchSummary(result.data));

      pushToast({
        title: "Item removed",
        description:
          result.source === "backend"
            ? "The batch totals were updated for everyone."
            : "Removed from local demo mode.",
        tone: result.source === "backend" ? "success" : "warning",
      });
    } catch (removeError) {
      pushToast({
        title: "Unable to remove item",
        description: extractErrorMessage(removeError, "Please try again."),
        tone: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseBatch = async () => {
    setActionLoading(true);

    try {
      const result = await closeBatch(batchId, session);
      setBatch(result.data);
      setSource(result.source);
      setSummary((current) => current);
      pushToast({
        title: "Batch closed",
        description: "No more items can be added to this order window.",
        tone: "success",
      });
    } catch (closeError) {
      pushToast({
        title: "Unable to close batch",
        description: extractErrorMessage(closeError, "Please try again."),
        tone: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-grid">
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={6} />
        <PanelSkeleton lines={5} />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <EmptyState
        action={
          <button className="button-primary" onClick={loadBatch} type="button">
            <RefreshCw size={16} />
            Retry
          </button>
        }
        description={error || "This batch could not be found."}
        icon={CircleSlash2}
        title="Batch unavailable"
      />
    );
  }

  const time = getTimeRemaining(batch.expiresAt);
  const isBatchOwner = getEntityId(batch.initiator) === getEntityId(user?.id);

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong overflow-hidden rounded-[32px] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                <Sparkles size={14} />
                Batch detail
              </span>
              <StatusBadge status={batch.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {batch.restaurantName}
            </h1>
            <p className="mt-2 text-base text-slate-400">
              Delivering to {batch.buildingId} • closes at{" "}
              {formatDateTime(batch.expiresAt)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div
              className={`inline-flex items-center gap-3 rounded-[24px] border px-4 py-3 text-sm ${
                time.isExpired
                  ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                  : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
              }`}
            >
              <Clock3 size={16} />
              <span>{time.label}</span>
            </div>

            <button
              className="button-secondary"
              onClick={handleCloseBatch}
              disabled={!isBatchOwner || batch.status === "CLOSED" || actionLoading}
              type="button"
            >
              <CircleSlash2 size={16} />
              {batch.status === "CLOSED"
                ? "Batch closed"
                : isBatchOwner
                  ? "Close batch"
                  : "Owner can close"}
            </button>
          </div>
        </div>
      </section>

      {source === "demo" ? (
        <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-50">
          Demo mode is driving this batch. Real-time Socket.IO sync is available
          when the backend is connected with a backend-issued JWT.
        </div>
      ) : null}

      <div className="dashboard-grid">
        <div className="xl:sticky xl:top-6 xl:self-start">
          <UserListPanel batch={batch} currentUserId={user?.id} />
        </div>

        <div className="space-y-6">
          <ActivityFeed batch={batch} />
          <BatchItemList
            actionIcon={Trash2}
            batch={batch}
            currentUserId={user?.id}
            onRemoveItem={handleRemoveItem}
            removing={actionLoading}
          />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <SummaryPanel batch={batch} summary={summary} />
        </div>
      </div>

      <AddItemComposer
        disabled={batch.status === "CLOSED" || time.isExpired}
        onSubmit={handleAddItem}
        pending={actionLoading}
      />
    </div>
  );
}
