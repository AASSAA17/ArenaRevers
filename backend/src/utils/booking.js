/**
 * Calculate booking amount based on arena price and duration
 */
export const calculateBookingAmount = async (arena, startDatetime, endDatetime, promoCode = null) => {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);

  // Calculate hours (including partial hours)
  const hours = (end - start) / (1000 * 60 * 60);

  // Base amount
  let amount = Number(arena.pricePerHour) * hours;

  // TODO: Apply schedule modifiers if needed
  // TODO: Apply promo code discount if valid

  return amount;
};

/**
 * Calculate hours between two dates
 */
export const calculateHours = (start, end) => {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
};

