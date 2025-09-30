import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { bus } from "@/lib/event";

export async function POST(req: Request) {
  const { type, payload } = await req.json();
  const id = crypto.randomUUID();

  db.insert(eventInfo).values({
    id,
    type,
    payload: JSON.stringify(payload),
    status: "pending",
  }).run();

  // notify processor
  bus.emit("event.created", { id });

  return Response.json({ id, status: "queued" });
}