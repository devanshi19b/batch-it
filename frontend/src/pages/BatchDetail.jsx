import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Participants from "../components/Participants";
import ActivityFeed from "../components/ActivityFeed";
import SummaryPanel from "../components/SummaryPanel";
import AddItemBar from "../components/AddItemBar";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { AuthContext } from "../context/AuthContext";

const DEMO_DURATION_MS = 18 * 60 * 1000 + 24 * 1000;
const ACCENT_COLORS = ["#FF8A3D", "#5D8BFF", "#21B87C", "#F25F7A", "#9F7AEA"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatTime(seconds) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function formatRelativeTime(value) {
  if (!value) {
    return "Now";
  }

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes <= 0) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name) {
  return String(name || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getUserId(userRef) {
  return userRef?.id || userRef?._id || userRef || "";
}

function getUserName(userRef, currentUserId) {
  const id = getUserId(userRef);

  if (userRef?.name) {
    return id && id === currentUserId ? "You" : userRef.name;
  }

  if (id && id === currentUserId) {
    return "You";
  }

  if (!id) {
    return "Guest";
  }

  return `Member ${String(id).slice(-4).toUpperCase()}`;
}

function getRoleLabel(userRef, initiatorId) {
  const id = getUserId(userRef);

  if (id && id === initiatorId) {
    return "Host";
  }

  if (userRef?.role) {
    return userRef.role[0].toUpperCase() + userRef.role.slice(1);
  }

  return "Participant";
}

function getRemainingSeconds(expiresAt, now) {
  if (!expiresAt) {
    return Math.floor(DEMO_DURATION_MS / 1000);
  }

  return Math.max(Math.floor((new Date(expiresAt).getTime() - now) / 1000), 0);
}

function createFallbackBatch(batchId, currentUser) {
  const host = currentUser || {
    id: "demo-user",
    name: "You",
    email: "demo@batchit.app",
    role: "student",
  };
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + DEMO_DURATION_MS).toISOString();

  return {
    _id: batchId || "4821",
    initiator: host,
    buildingId: "HQ - Floor 5",
    restaurantName: "Theory Cafe",
    status: "LIVE",
    createdAt,
    updatedAt: createdAt,
    expiresAt,
    items: [
      {
        _id: "demo-1",
        name: "Korean Fried Sandwich",
        quantity: 1,
        price: 285,
        user: { id: "u2", name: "Rohit", email: "rohit@batchit.app", role: "student" },
      },
      {
        _id: "demo-2",
        name: "Chilli Garlic Momos",
        quantity: 2,
        price: 180,
        user: { id: "u3", name: "Meera", email: "meera@batchit.app", role: "student" },
      },
      {
        _id: "demo-3",
        name: "Cold Brew Pitcher",
        quantity: 1,
        price: 220,
        user: host,
      },
      {
        _id: "demo-4",
        name: "Truffle Fries",
        quantity: 1,
        price: 190,
        user: { id: "u4", name: "Arjun", email: "arjun@batchit.app", role: "student" },
      },
    ],
  };
}

function buildParticipantTotals(batch, currentUserId) {
  const participantMap = new Map();
  const initiatorId = getUserId(batch?.initiator);
  let accentIndex = 0;

  const ensureParticipant = (userRef) => {
    const id = getUserId(userRef);

    if (!id) {
      return null;
    }

    if (!participantMap.has(id)) {
      participantMap.set(id, {
        id,
        name: getUserName(userRef, currentUserId),
        role: getRoleLabel(userRef, initiatorId),
        status:
          batch.status === "CLOSED"
            ? "reviewing final split"
            : id === currentUserId
              ? "adding now"
              : "live in batch",
        accent: ACCENT_COLORS[accentIndex % ACCENT_COLORS.length],
        initials: getInitials(getUserName(userRef, currentUserId)),
        total: 0,
        totalLabel: formatCurrency(0),
        itemCount: 0,
      });
      accentIndex += 1;
    }

    return participantMap.get(id);
  };

  ensureParticipant(batch.initiator);

  (batch.items || []).forEach((item) => {
    const participant = ensureParticipant(item.user);
    if (!participant) {
      return;
    }

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    participant.total += quantity * price;
    participant.itemCount += quantity;
    participant.totalLabel = formatCurrency(participant.total);
  });

  return Array.from(participantMap.values()).sort((left, right) => {
    if (left.role === "Host" && right.role !== "Host") {
      return -1;
    }

    if (right.role === "Host" && left.role !== "Host") {
      return 1;
    }

    return right.total - left.total;
  });
}

function buildActivityEntries(batch, currentUserId, participantMap) {
  const entries = [];
  const getParticipantView = (userRef) => {
    const userId = getUserId(userRef);

    return (
      participantMap[userId] || {
        id: userId,
        name: getUserName(userRef, currentUserId),
        accent: ACCENT_COLORS[0],
      }
    );
  };

  if (batch.status === "CLOSED") {
    const participant = getParticipantView(batch.initiator);
    entries.push({
      id: `closed-${batch._id}`,
      participant,
      initials: getInitials(participant.name),
      action: "closed the batch",
      detail: "No more items can be added to the shared cart",
      time: formatRelativeTime(batch.updatedAt),
      tone: "warning",
    });
  }

  [...(batch.items || [])]
    .reverse()
    .forEach((item, index) => {
      const participant = getParticipantView(item.user);
      const quantity = Number(item.quantity) || 0;
      const lineTotal = quantity * (Number(item.price) || 0);
      entries.push({
        id: `item-${item._id || `${item.name}-${index}`}`,
        participant,
        initials: getInitials(participant.name),
        action: `added ${item.name}`,
        detail: `${quantity} item${quantity === 1 ? "" : "s"} • ${formatCurrency(lineTotal)}`,
        time: index === 0 ? "Live" : "Cart",
        tone: index === 0 ? "accent" : "default",
      });
    });

  const initiator = getParticipantView(batch.initiator);
  entries.push({
    id: `created-${batch._id}`,
    participant: initiator,
    initials: getInitials(initiator.name),
    action: "started this shared ordering session",
    detail: `Ordering from ${batch.restaurantName}`,
    time: formatRelativeTime(batch.createdAt),
    tone: "muted",
  });

  return entries;
}

function buildBatchViewModel(batch, currentUserId, now) {
  const participants = buildParticipantTotals(batch, currentUserId);
  const participantMap = Object.fromEntries(
    participants.map((participant) => [participant.id, participant])
  );

  const items = (batch.items || []).map((item) => {
    const participantId = getUserId(item.user);
    const participant =
      participantMap[participantId] || {
        id: participantId,
        name: getUserName(item.user, currentUserId),
        role: getRoleLabel(item.user, getUserId(batch.initiator)),
        accent: ACCENT_COLORS[0],
        initials: getInitials(getUserName(item.user, currentUserId)),
      };
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const lineTotal = quantity * price;

    return {
      id: item._id || `${item.name}-${participantId}`,
      name: item.name,
      quantity,
      price,
      participantId,
      participant,
      initials: participant?.initials || getInitials(getUserName(item.user, currentUserId)),
      category: "Shared cart item",
      note: price ? `${formatCurrency(price)} each` : "",
      lineTotal,
      lineTotalLabel: formatCurrency(lineTotal),
    };
  });

  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  const groupTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const memberCount = participants.length || 1;
  const remainingSeconds = getRemainingSeconds(batch.expiresAt, now);
  const startedAt = batch.createdAt ? new Date(batch.createdAt).getTime() : now;
  const endsAt = batch.expiresAt
    ? new Date(batch.expiresAt).getTime()
    : startedAt + DEMO_DURATION_MS;
  const duration = Math.max(endsAt - startedAt, 1000);
  const elapsed = Math.min(Math.max(now - startedAt, 0), duration);
  const progress = (elapsed / duration) * 100;
  const yourShare =
    participants.find((participant) => participant.id === currentUserId)?.total || 0;

  return {
    batchName: batch.buildingId
      ? `${batch.restaurantName} • ${batch.buildingId}`
      : `${batch.restaurantName} Session`,
    cuisine: batch.status === "CLOSED" ? "Final split is locked" : "Live group ordering session",
    items,
    participants,
    totalItems,
    groupTotal,
    memberCount,
    remainingSeconds,
    progress,
    yourShare,
    participantMap,
  };
}

export default function BatchDetail() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const currentUserId = user?.id || "demo-user";
  const [now, setNow] = useState(Date.now());
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyState, setCopyState] = useState("Invite people");
  const [draft, setDraft] = useState({
    name: "",
    quantity: "1",
    price: "",
    note: "",
    participantId: currentUserId,
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      participantId: current.participantId || currentUserId,
    }));
  }, [currentUserId]);

  useEffect(() => {
    let isMounted = true;

    const loadBatch = async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const res = await API.get(`/batch/${id}`);

        if (!isMounted) {
          return;
        }

        setBatch(res.data.data);
        setIsFallback(false);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBatch((current) => current || createFallbackBatch(id, user));
        setIsFallback(true);
        setErrorMessage(
          "Live batch data could not be loaded, so this workspace is showing a local demo session."
        );
      } finally {
        if (isMounted && !silent) {
          setIsLoading(false);
        }
      }
    };

    loadBatch();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    if (!id || isFallback) {
      return undefined;
    }

    const socket = getSocket();
    const handleBatchUpdated = (payload) => {
      if (payload?.batchId !== id || !payload.batch) {
        return;
      }

      setBatch(payload.batch);
      setErrorMessage("");
    };

    const handleConnect = () => {
      socket.emit("batch:join", id);
      setErrorMessage("");
    };

    const handleDisconnect = () => {
      setErrorMessage(
        "Realtime sync paused because the socket disconnected. We will resume when the connection returns."
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("batch:updated", handleBatchUpdated);

    if (socket.connected) {
      socket.emit("batch:join", id);
    }

    return () => {
      socket.emit("batch:leave", id);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("batch:updated", handleBatchUpdated);
    };
  }, [id, isFallback]);

  const batchView = useMemo(() => {
    if (!batch) {
      return null;
    }

    const view = buildBatchViewModel(batch, currentUserId, now);
    return {
      ...view,
      activities: buildActivityEntries(batch, currentUserId, view.participantMap),
    };
  }, [batch, currentUserId, now]);

  const handleFieldChange = (field) => (event) => {
    setDraft((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleLocalItemAdd = (name, quantity, price, participantId) => {
    const participants = buildParticipantTotals(batch, currentUserId);
    const participantLookup = Object.fromEntries(
      participants.map((participant) => [participant.id, participant])
    );
    const participant = participantLookup[participantId] || {
      id: participantId,
      name: participantId === currentUserId ? "You" : "Guest",
      role: "Participant",
      email: "",
    };

    setBatch((current) => ({
      ...current,
      items: [
        {
          _id: `local-${Date.now()}`,
          name,
          quantity,
          price,
          user: {
            id: participant.id,
            name: participant.name,
            email: participant.email,
            role: participant.role?.toLowerCase?.() || "student",
          },
        },
        ...(current.items || []),
      ],
      updatedAt: new Date().toISOString(),
    }));
    setActionMessage("Added to the demo batch locally.");
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    if (!batch || batch.status === "CLOSED") {
      return;
    }

    const trimmedName = draft.name.trim();
    const quantity = Number(draft.quantity);
    const price = Number(draft.price);

    if (!trimmedName || quantity <= 0 || price <= 0) {
      setActionMessage("Enter a valid item name, quantity, and price.");
      return;
    }

    setIsSubmitting(true);
    setActionMessage("");

    try {
      if (isFallback) {
        handleLocalItemAdd(trimmedName, quantity, price, draft.participantId);
      } else if (!token || token === "demo-token") {
        setActionMessage("Sign in with a real account to write to the live batch.");
      } else {
        const res = await API.post(`/batch/${id}/items`, {
          name: trimmedName,
          quantity,
          price,
        });
        setBatch(res.data.data);
        setActionMessage("Item added to the live batch.");
      }

      setDraft((current) => ({
        ...current,
        name: "",
        quantity: "1",
        price: "",
        note: "",
      }));
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Could not add the item to this batch."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseBatch = async () => {
    if (!batch || batch.status === "CLOSED") {
      return;
    }

    setIsSubmitting(true);
    setActionMessage("");

    try {
      if (isFallback) {
        setBatch((current) => ({
          ...current,
          status: "CLOSED",
          updatedAt: new Date().toISOString(),
        }));
        setActionMessage("Demo batch closed locally.");
      } else if (!token || token === "demo-token") {
        setActionMessage("Sign in with a real account to close the live batch.");
      } else {
        const res = await API.patch(`/batch/${id}/close`);
        setBatch(res.data.data);
        setActionMessage("Batch closed successfully.");
      }
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Could not close this batch right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvite = async () => {
    const inviteMessage = `${batchView?.batchName || "Batch"} • Join code ${id}`;

    if (!navigator?.clipboard) {
      setCopyState("Code shown");
      window.setTimeout(() => setCopyState("Invite people"), 1800);
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopyState("Invite copied");
    } catch {
      setCopyState("Copy failed");
    }

    window.setTimeout(() => setCopyState("Invite people"), 1800);
  };

  if (isLoading && !batchView) {
    return (
      <div className="batch-page">
        <div className="batch-shell">
          <section className="hero-card">
            <div className="empty-state">
              <p className="eyebrow">Loading session</p>
              <h1>Pulling the shared batch into view...</h1>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!batchView) {
    return (
      <div className="batch-page">
        <div className="batch-shell">
          <section className="hero-card">
            <div className="empty-state">
              <p className="eyebrow">Batch unavailable</p>
              <h1>We could not open this ordering session.</h1>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-page">
      <div className="batch-shell">
        {(errorMessage || actionMessage) && (
          <div className={`status-banner ${isFallback ? "status-banner--warning" : ""}`}>
            <span>{errorMessage || actionMessage}</span>
          </div>
        )}

        <Header
          batchId={id}
          batchName={batchView.batchName}
          restaurantName={batch.restaurantName}
          cuisine={batchView.cuisine}
          inviteCode={id}
          memberCount={batchView.memberCount}
          totalItems={batchView.totalItems}
          groupTotal={formatCurrency(batchView.groupTotal)}
          remainingLabel={batch.status === "CLOSED" ? "Closed" : formatTime(batchView.remainingSeconds)}
          progress={batchView.progress}
          batchStatus={batch.status === "CLOSED" ? "closed" : "live"}
          copyState={copyState}
          onCopyInvite={handleCopyInvite}
          onCloseBatch={handleCloseBatch}
        />

        <div className="batch-grid">
          <Participants
            participants={batchView.participants}
            activeCount={batchView.memberCount}
            batchStatus={batch.status === "CLOSED" ? "closed" : "live"}
            yourShare={formatCurrency(batchView.yourShare)}
          />

          <SummaryPanel
            batchStatus={batch.status === "CLOSED" ? "closed" : "live"}
            items={batchView.items}
            groupTotal={formatCurrency(batchView.groupTotal)}
            yourShare={formatCurrency(batchView.yourShare)}
            averageShare={formatCurrency(batchView.groupTotal / batchView.memberCount)}
          />

          <ActivityFeed
            entries={batchView.activities}
            batchStatus={batch.status === "CLOSED" ? "closed" : "live"}
            remainingLabel={formatTime(batchView.remainingSeconds)}
          />
        </div>

        <AddItemBar
          draft={draft}
          participants={batchView.participants}
          batchStatus={batch.status === "CLOSED" ? "closed" : "live"}
          onChange={handleFieldChange}
          onSubmit={handleAddItem}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
