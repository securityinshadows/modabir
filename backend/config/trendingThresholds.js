module.exports = {
    flood: { threshold: 5, windowMinutes: 10 },
    fire: { threshold: 3, windowMinutes: 5 },
    storm: { threshold: 4, windowMinutes: 8 },
    earthquake: { threshold: 2, windowMinutes: 20 },
    medical: { threshold: 6, windowMinutes: 10 },
  };

// Threshold values are set based on the number of reports within a specific time window (in minutes) for each type of alert.
// These values can be adjusted based on the frequency of reports and the urgency of the situation.
// For example, if we receive 5 flood reports within 10 minutes, a trending alert will be created.