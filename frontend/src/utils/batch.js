export const calculateBatchMetrics = (batch) => {
  const items = Array.isArray(batch?.items) ? batch.items : [];
  const contributors = new Map();
  const users = new Map();

  if (batch?.initiator) {
    users.set(batch.initiator.id || batch.initiator._id, batch.initiator);
  }

  let totalAmount = 0;
  let totalItems = 0;

  const activity = items
    .map((item, index) => {
      const user = item.user || batch?.initiator || null;
      const userId = user?.id || user?._id || `user-${index}`;
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const lineTotal = quantity * price;

      totalAmount += lineTotal;
      totalItems += quantity;
      users.set(userId, user);

      const existing = contributors.get(userId) || {
        user,
        amount: 0,
        itemCount: 0,
        lineItems: 0,
      };

      contributors.set(userId, {
        user,
        amount: existing.amount + lineTotal,
        itemCount: existing.itemCount + quantity,
        lineItems: existing.lineItems + 1,
      });

      return {
        id: item._id || `${batch?._id}-${index}`,
        createdAt: item.createdAt || batch?.updatedAt || batch?.createdAt,
        user,
        quantity,
        price,
        amount: lineTotal,
        itemName: item.name,
      };
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  return {
    totalAmount,
    totalItems,
    users: Array.from(users.values()).filter(Boolean),
    contributors: Array.from(contributors.values()).sort(
      (left, right) => right.amount - left.amount
    ),
    activity,
  };
};
