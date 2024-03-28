export const CONNECTION_CREATE = "connections.create";
export const CONNECTION_ACCEPT = "connections.accept";
export const CONNECTION_LIST = "connections.list";
export const CONNECTION_GET = "connections.get";
export const CONNECTION_DELETE = "connections.delete";

export type ConnectionEvent =
  | typeof CONNECTION_CREATE
  | typeof CONNECTION_ACCEPT
  | typeof CONNECTION_LIST
  | typeof CONNECTION_GET
  | typeof CONNECTION_DELETE;

export const CONNECTION_EVENTS: ConnectionEvent[] = [
  CONNECTION_CREATE,
  CONNECTION_ACCEPT,
  CONNECTION_LIST,
  CONNECTION_GET,
  CONNECTION_DELETE,
];

export const SCHEMA_CREATE = "schemas.create";
export const SCHEMA_GET = "schemas.get";
export const SCHEMA_LIST = "schemas.list";

export type SchemaEvent =
  | typeof SCHEMA_CREATE
  | typeof SCHEMA_GET
  | typeof SCHEMA_LIST;

export const SCHEMA_EVENTS: SchemaEvent[] = [
  SCHEMA_CREATE,
  SCHEMA_LIST,
  SCHEMA_GET,
];

export const CRED_DEF_CREATE = "credentials.definition.create";
export const CRED_DEF_LIST = "credentials.definition.list";
export const CRED_DEF_GET = "credentials.definition.get";
export const CRED_SEND_OFFER = "credentials.send-offer";
export const CRED_LIST = "credentials.list";
export const CRED_OFFER_ACCEPT = "credentials.offer.accept";
export const CRED_OFFER_DECLINE = "credentials.offer.decline";
export const CRED_DELETE = "credentials.delete";
export const CRED_GET = "credentials.get";

export type CredentialEvent =
  | typeof CRED_DEF_CREATE
  | typeof CRED_DEF_LIST
  | typeof CRED_DEF_GET
  | typeof CRED_SEND_OFFER
  | typeof CRED_LIST
  | typeof CRED_OFFER_ACCEPT
  | typeof CRED_OFFER_DECLINE
  | typeof CRED_DELETE
  | typeof CRED_GET;

export const CRED_EVENTS: CredentialEvent[] = [
  CRED_DEF_CREATE,
  CRED_DEF_LIST,
  CRED_DEF_GET,
  CRED_SEND_OFFER,
  CRED_LIST,
  CRED_OFFER_ACCEPT,
  CRED_OFFER_DECLINE,
  CRED_DELETE,
  CRED_GET,
];

export const PROOF_LIST = "proofs.list";
export const PROOF_DELETE = "proofs.delete";
export const PROOF_GET = "proofs.get";
export const PROOF_ACCEPT = "proofs.accept";
export const PROOF_REQUEST = "proofs.request";
export const PROOF_DECLINE = "proofs.decline";

export type ProofEvent =
  | typeof PROOF_LIST
  | typeof PROOF_DELETE
  | typeof PROOF_GET
  | typeof PROOF_ACCEPT
  | typeof PROOF_REQUEST
  | typeof PROOF_DECLINE;

export const PROOF_EVENTS: ProofEvent[] = [
  PROOF_LIST,
  PROOF_DELETE,
  PROOF_GET,
  PROOF_ACCEPT,
  PROOF_REQUEST,
  PROOF_DECLINE,
];

export const MESSAGE_MAKE = "messages.make";
export const MESSAGE_LIST = "messages.list";
export const MESSAGE_DELETE = "messages.delete";

export type BasicMessageEvent =
  | typeof MESSAGE_MAKE
  | typeof MESSAGE_LIST
  | typeof MESSAGE_DELETE;

export const BASIC_MESSAGE_EVENTS: BasicMessageEvent[] = [
  MESSAGE_MAKE,
  MESSAGE_LIST,
  MESSAGE_DELETE,
];

export const ALL_EVENTS = [
  ...SCHEMA_EVENTS,
  ...CRED_EVENTS,
  ...PROOF_EVENTS,
  ...CONNECTION_EVENTS,
  ...BASIC_MESSAGE_EVENTS,
];
