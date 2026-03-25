const calculateMonthlySpend = (orders) => {
  const currentMonth = new Date().getMonth();

  return orders
    .filter((o) => new Date(o.createdAt).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.total, 0);
};

export default calculateMonthlySpend;