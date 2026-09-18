import { EventEmitter } from "events";

// Minimal in-process pub/sub for pushing partner-activity events to any
// currently-connected admin SSE streams (see notification.controller.ts's
// streamAdminNotifications). In-process only — fine at this app's scale;
// would need a shared broker (e.g. Redis pub/sub) only if the server ever
// runs as more than one instance.

export type PartnerActivityEvent =
  | { type: "customer_created"; partnerName: string; customerName: string }
  | { type: "loan_created"; partnerName: string; customerName: string };

const EVENT_NAME = "partner-activity";
const emitter = new EventEmitter();

export const emitPartnerActivity = (event: PartnerActivityEvent) => {
  emitter.emit(EVENT_NAME, event);
};

export const subscribePartnerActivity = (
  listener: (event: PartnerActivityEvent) => void
): (() => void) => {
  emitter.on(EVENT_NAME, listener);
  return () => emitter.off(EVENT_NAME, listener);
};
