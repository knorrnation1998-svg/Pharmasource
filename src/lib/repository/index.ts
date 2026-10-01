import "server-only";
import type { Repository } from "./types";
import { jsonRepository } from "./json-driver";
import { tursoRepository } from "./turso-driver";

/**
 * Driver selection happens once, here. Nothing downstream knows or cares
 * which store is live.
 */
function select(): Repository {
  const driver = process.env.DATA_DRIVER ?? "json";

  if (driver === "turso") return tursoRepository;

  // Fail loudly rather than silently losing every write to a read-only FS.
  const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY);
  if (isServerless && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATA_DRIVER=json cannot persist on a serverless host (read-only filesystem). " +
        "Set DATA_DRIVER=turso and provide TURSO_DATABASE_URL."
    );
  }
  return jsonRepository;
}

export const repository: Repository = select();
export type { Repository };
