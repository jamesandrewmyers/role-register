import Emittery from "emittery";

export const bus = new Emittery<{
  "event.created": { id: string };
}>();

import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";

export interface EventPayload {
  [key: string]: any;
}

export async function enqueueEvent(
  type: string,
  payload: EventPayload
): Promise<{ id: string }> {
  const id = crypto.randomUUID();

  db.insert(eventInfo).values({
    id,
    type,
    payload: JSON.stringify(payload),
    status: "pending",
  }).run();

  // Notify queue runner to spawn worker
  bus.emit("event.created", { id });

  return { id };
}
