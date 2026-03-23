import {
  formatCountdown,
  formatCurrency,
  formatRelativeTime,
  getInitials,
} from "./formatters";

const PARTICIPANT_COLORS = [
  "from-emerald-300 to-teal-500",
  "from-sky-300 to-blue-500",
  "from-amber-300 to-orange-500",
  "from-fuchsia-300 to-pink-500",
  "from-violet-300 to-indigo-500",
];

export function getUserId(user) {
  return user?.id || user?._id || user || "";
}

export function getUserName(user, currentUserId) {
  const userId = getUserId(user);

  if (userId && currentUserId && userId === currentUserId) {
    return "You";
  }

  return user?.name || (userId ? `Member ${String(userId).slice(-4).toUpperCase()}` : "Guest");
}

export function getLineTotal(item) {
  return (Number(item?.quantity) || 0) * (Number(item?.price) || 0);
}

export function getBatchTotal(batch) {
  return (batch?.items || []).reduce((sum, item) => sum + getLineTotal(item), 0);
}

export function getBatchItemCount(batch) {
  return (batch?.items || []).reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
}

export function buildParticipants(batch, currentUserId) {
  const participants = new Map();
  const initiatorId = getUserId(batch?.initiator);
  let colorIndex = 0;

  const ensureParticipant = (user) => {
    const id = getUserId(user);

    if (!id) {
      return null;
    }

    if (!participants.has(id)) {
      const name = getUserName(user, currentUserId);
      participants.set(id, {
        id,
        name,
        email: user?.email || "",
        role: id === initiatorId ? "Host" : "Participant",
        total: 0,
        totalLabel: formatCurrency(0),
        itemCount: 0,
        lastAction: id === initiatorId ? "Started the batch" : "Joined the session",
        initials: getInitials(name),
        accent: PARTICIPANT_COLORS[colorIndex % PARTICIPANT_COLORS.length],
      });
      colorIndex += 1;
    }

    return participants.get(id);
  };

  ensureParticipant(batch?.initiator);

  (batch?.items || []).forEach((item) => {
    const participant = ensureParticipant(item.user);

    if (!participant) {
      return;
    }

    participant.total += getLineTotal(item);
    participant.totalLabel = formatCurrency(participant.total);
    participant.itemCount += Number(item.quantity) || 0;
    participant.lastAction = item.name ? `Added ${item.name}` : participant.lastAction;
  });

  return Array.from(participants.values()).sort((left, right) => {
    if (left.role === "Host" && right.role !== "Host") {
      return -1;
    }

    if (right.role === "Host" && left.role !== "Host") {
      return 1;
    }

    return right.total - left.total;
  });
}

export function buildActivityEntries(batch, currentUserId) {
  const participants = buildParticipants(batch, currentUserId);
  const lookup = Object.fromEntries(participants.map((participant) => [participant.id, participant]));
  const items = [...(batch?.items || [])].reverse();
  const entries = items.map((item, index) => {
    const owner = lookup[getUserId(item.user)];
    const quantity = Number(item.quantity) || 0;

    return {
      id: item._id || `${item.name}-${index}`,
      actor: owner?.name || getUserName(item.user, currentUserId),
      actorInitials: owner?.initials || getInitials(getUserName(item.user, currentUserId)),
      accent: owner?.accent || PARTICIPANT_COLORS[0],
      title: item.name,
      detail: `${quantity} x ${formatCurrency(item.price)} • ${formatCurrency(getLineTotal(item))}`,
      timeLabel: index === 0 ? "Latest" : "Cart update",
    };
  });

  entries.push({
    id: `session-${batch?._id}`,
    actor: getUserName(batch?.initiator, currentUserId),
    actorInitials: getInitials(getUserName(batch?.initiator, currentUserId)),
    accent: lookup[getUserId(batch?.initiator)]?.accent || PARTICIPANT_COLORS[0],
    title: "Session started",
    detail: `${batch?.restaurantName || "Batch"} opened for ${batch?.buildingId || "the group"}`,
    timeLabel: formatRelativeTime(batch?.createdAt),
  });

  if (batch?.status === "CLOSED") {
    entries.unshift({
      id: `closed-${batch?._id}`,
      actor: getUserName(batch?.initiator, currentUserId),
      actorInitials: getInitials(getUserName(batch?.initiator, currentUserId)),
      accent: lookup[getUserId(batch?.initiator)]?.accent || PARTICIPANT_COLORS[0],
      title: "Batch closed",
      detail: "The order is locked and ready for checkout.",
      timeLabel: formatRelativeTime(batch?.updatedAt),
    });
  }

  return entries;
}

export function buildBatchDashboard(batch, currentUserId) {
  const participants = buildParticipants(batch, currentUserId);
  const total = getBatchTotal(batch);
  const itemCount = getBatchItemCount(batch);
  const yourTotal =
    participants.find((participant) => participant.id === currentUserId)?.total || 0;
  const items = [...(batch?.items || [])]
    .map((item) => ({
      id: item._id || `${item.name}-${getUserId(item.user)}`,
      name: item.name,
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      total: getLineTotal(item),
      totalLabel: formatCurrency(getLineTotal(item)),
      ownerId: getUserId(item.user),
      ownerName: getUserName(item.user, currentUserId),
      ownerInitials: getInitials(getUserName(item.user, currentUserId)),
      ownerAccent:
        participants.find((participant) => participant.id === getUserId(item.user))?.accent ||
        PARTICIPANT_COLORS[0],
    }))
    .reverse();

  return {
    participants,
    items,
    total,
    totalLabel: formatCurrency(total),
    itemCount,
    participantCount: participants.length,
    averagePerPersonLabel: formatCurrency(participants.length ? total / participants.length : 0),
    yourTotalLabel: formatCurrency(yourTotal),
    countdownLabel: formatCountdown(batch?.expiresAt, batch?.status),
    activityEntries: buildActivityEntries(batch, currentUserId),
  };
}

export function mapBatchCard(batch, currentUserId) {
  const participants = buildParticipants(batch, currentUserId);
  const total = getBatchTotal(batch);
  const itemCount = getBatchItemCount(batch);
  const countdownLabel = formatCountdown(batch?.expiresAt, batch?.status);
  const isClosed = batch?.status === "CLOSED";

  return {
    id: batch?._id,
    title: batch?.restaurantName || "Untitled batch",
    location: batch?.buildingId || "Shared location",
    status: batch?.status || "LIVE",
    countdownLabel,
    participantCount: participants.length,
    itemCount,
    total,
    totalLabel: formatCurrency(total),
    hostName: getUserName(batch?.initiator, currentUserId),
    lastUpdatedLabel: formatRelativeTime(batch?.updatedAt || batch?.createdAt),
    chipLabel: isClosed ? "Closed" : countdownLabel === "00:00" ? "Needs closeout" : "Live now",
  };
}

export function upsertBatchCard(cards, batch, currentUserId) {
  const nextCard = mapBatchCard(batch, currentUserId);
  const nextCards = [nextCard, ...cards.filter((card) => card.id !== nextCard.id)];

  return nextCards.sort((left, right) => {
    const leftLive = left.status === "LIVE" ? 0 : 1;
    const rightLive = right.status === "LIVE" ? 0 : 1;

    if (leftLive !== rightLive) {
      return leftLive - rightLive;
    }

    return (right.id || "").localeCompare(left.id || "");
  });
}
