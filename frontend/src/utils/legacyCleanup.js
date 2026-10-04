// Older versions of CivicFix kept complaints (including base64 photos) in the
// browser. Complaints now live only in MongoDB, so remove that stale data.
// This only deletes the obsolete complaint key; auth tokens are not touched
// and no complaint data is ever written to browser storage.

const LEGACY_COMPLAINT_KEYS = ["civicfix_complaints"];

export const removeLegacyComplaintData = () => {
  for (const storage of ["localStorage", "sessionStorage"]) {
    try {
      LEGACY_COMPLAINT_KEYS.forEach((key) => window[storage].removeItem(key));
    } catch {
      // Storage can be blocked (private mode, policies). Nothing to clean then.
    }
  }
};
