// We import the required modules
const Report = require('../models/Report');
const TrendingAlert = require('../models/TrendingAlert');
const thresholds = require('../config/trendingThresholds');
const asyncHandler = require('express-async-handler');
const websocketService = require('./webSocketService');

// We create constants for config
const TRENDING_RADIUS_METERS = 5000; // 5km search radius
const ALERT_EXPIRY_HOURS = 24; // Trending alerts expire after 6 hours

// We check if new reports meet the criteria to trigger a trending alert
// This function is called whenever a new report is created
async function checkTrending(report) {
  try {
    // We destructure essential properties from the incoming report
    const { type, location, createdAt } = report;

    // We retrieve threshold rules for this report type
    const rule = thresholds[type];
    if (!rule) return; // Exit if no rules are defined for this type

    // We calculate the time window for recent reports (current time minus configured window)
    const recentTime = new Date(Date.now() - rule.windowMinutes * 60000);

    // We find all recent reports of same type within the radius
    const nearbyReports = await Report.find({
      type,
      time: { $gte: recentTime },
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: TRENDING_RADIUS_METERS,
        },
      },
    }).lean(); // lean() has better performance with simple objects, it transforms the documents into plain JavaScript objects

    // We proceed ONLY if we meet the minimum threshold of reports
    if (nearbyReports.length >= rule.threshold) {
      // We calculate the 'centroid' or average of all reports for the alert location
      // Basically the center of all the reports in the cluster
      // This is done by summing up the coordinates and dividing by the number of reports
      const totalCoordinates = nearbyReports.reduce(
        (acc, r) => {
          acc.lng += r.location.coordinates[0];
          acc.lat += r.location.coordinates[1];
          return acc;
        },
        { lng: 0, lat: 0 }
      );

      const avgLng = totalCoordinates.lng / nearbyReports.length;
      const avgLat = totalCoordinates.lat / nearbyReports.length;

      // We determine the severity level based on report count
      const severity = determineSeverityLevel(nearbyReports.length, rule);

      // If there's a similar alert, we prevent duplicates
      // We check if an alert of the same type already exists within the radius and time window
      const existingAlert = await TrendingAlert.findOne({
        type,
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [avgLng, avgLat],
            },
            $maxDistance: TRENDING_RADIUS_METERS,
          },
        },
        createdAt: { $gte: recentTime },
      });

      // This is where we prevent duplicates
      if (!existingAlert) {
        const newAlert = await TrendingAlert.create({
          type,
          summary: generateAlertSummary(type, nearbyReports.length, severity),
          location: { type: 'Point', coordinates: [avgLng, avgLat] },
          reportCount: nearbyReports.length,
          reports: nearbyReports.map(r => r._id),
          severity,
          expiresAt: new Date(Date.now() + ALERT_EXPIRY_HOURS * 3600000),
        });

        // We broadcast real-time alert to connected clients
        websocketService.broadcast('new_trending_alert', newAlert);
      } else {

        // This prevents duplicate counting while maintaining all report references
        const allReportIds = [
            ...new Set([
              ...existingAlert.reports.map(id => id.toString()),
              ...nearbyReports.map(r => r._id.toString())
            ])
          ];
        // We update the existing alert with new reports and count
        await TrendingAlert.updateOne(
            { _id: existingAlert._id },
            {
              $set: { 
                reports: allReportIds,
                reportCount: allReportIds.length, // We use the actual unique count
                severity: determineSeverityLevel(
                  allReportIds.length, // and the actual unique count for severity calculation
                  rule
                ),
                summary: generateAlertSummary(type, allReportIds.length, severity),
                expiresAt: new Date(Date.now() + ALERT_EXPIRY_HOURS * 3600000)
              }
            }
          );
        }
      }
  } catch (error) {
    // we log the error but don't crash - trending alerts are non-critical
    console.error('Error in trending monitor:', error);
  }
}

// we determine the severity level by avaeraging the report count and threshold
function determineSeverityLevel(reportCount, rule) {
  // We calculate how many times the threshold has been exceeded
  const thresholdMultiple = reportCount / rule.threshold;
// If the report count is between 1 and 2 times the threshold, we return 'moderate'
// If the report count is between 2 and 3 times the threshold, we return 'high'
// If the report count is 3 or more times the threshold, we return 'critical'
  if (thresholdMultiple >= 3) return 'critical';
  if (thresholdMultiple >= 2) return 'high';
  return 'moderate';
}

// Here we generate a summary for the alert based on the severity, type, and count
// This is a simple function that returns a string summary
function generateAlertSummary(type, count, severity) {
  const severityMap = {
    moderate: 'increased',
    high: 'high',
    critical: 'extremely high'
  };

  return `${severityMap[severity]} ${type} activity detected (${count} reports)`;
}

module.exports = {
  checkTrending: asyncHandler(checkTrending),
  // These are exposed for testing purposes only
  _private: {
    determineSeverityLevel,
    generateAlertSummary
  }
};