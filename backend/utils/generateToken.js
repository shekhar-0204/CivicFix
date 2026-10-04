import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

// role is "citizen" or "admin"; the auth middleware re-checks it against the DB.
export const generateToken = ({ id, role }, remember = true) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: remember ? env.jwtExpiresIn : env.jwtSessionExpiresIn,
  });

// Only HS256 is accepted, which blocks "alg: none" and algorithm-swap tricks.
export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
