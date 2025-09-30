import Emittery from "emittery";

export const bus = new Emittery<{
  "event.created": { id: string };
}>();