// This is a simple in-memory spam prevention mechanism
// We create a map to store when the last report was sent by each user
// We use a cooldown period to prevent spamming
const lastReports = new Map(); 
const COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown

// This function checks if a user can post a report based on their anonId
function canPostReport(anonId) {
  const now = Date.now();
  // We check the prev stored last report time for the user
  const last = lastReports.get(anonId);
// If the last report time is within the cooldown period, we return false
  if (last && now - last < COOLDOWN_MS) {
    return false;
  }
  // If the user is allowed to post, we update the last report time for that user

  lastReports.set(anonId, now);
  return true;
}

module.exports = { canPostReport };
