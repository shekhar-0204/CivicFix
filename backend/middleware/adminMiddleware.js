import { authorize } from "./authMiddleware.js";

// Use after `protect`. A citizen token can never pass this check, whatever the
// React app does, because the role is read from the signed JWT and the account
// is loaded from the Admin collection.
export const adminOnly = authorize("admin");
