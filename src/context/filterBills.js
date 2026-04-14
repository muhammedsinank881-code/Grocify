export const filterBills = (bills, type, customRange = {}) => {
  const now = new Date();

  if (type === "thisMonth") {
    return bills.filter(b => {
      const d = new Date(b.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  }

  if (type === "last6Months") {
    const past = new Date();
    past.setMonth(now.getMonth() - 5);

    return bills.filter(b => {
      const d = new Date(b.date);
      return d >= past && d <= now;
    });
  }

  if (type === "custom") {
    return bills.filter(b => {
      const d = new Date(b.date);
      return d >= new Date(customRange.start) &&
             d <= new Date(customRange.end);
    });
  }

  return bills;
};