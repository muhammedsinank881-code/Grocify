export const getMonthlyProfit = (bills, products) => {
  const monthlyData = {};

  bills.forEach(bill => {
    const month = new Date(bill.date).toLocaleString("default", {
      month: "short",
      year: "numeric"
    });

    let billProfit = 0;

    bill.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);

      if (product) {
        billProfit += (product.price - product.costPrice) * item.quantity;
      }
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += billProfit;
  });

  return Object.keys(monthlyData).map(month => ({
    month,
    profit: monthlyData[month]
  }));
};