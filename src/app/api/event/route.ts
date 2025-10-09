import * as eventInfoService from "@/services/eventInfoService";
import { bus } from "@/lib/event";
import type { EventInfoId } from "@/domain/entities/eventInfo";

export async function POST(req: Request) {
  const { type, payload } = await req.json();
  const id = crypto.randomUUID();

  eventInfoService.createEvent({
    id: id as EventInfoId,
    type,
    payload: JSON.stringify(payload),
    status: "pending",
  });

  // notify processor
  bus.emit("event.created", { id });

  return Response.json({ id, status: "queued" });
}