const rateLimit = new Map();

export const checkRateLimit = (userId, limit = 100, windowMs = 60000) => {
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  
  // Remove old requests
  const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimit.set(userId, validRequests);
  return true;
}; 