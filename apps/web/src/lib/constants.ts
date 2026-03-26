export const APP_NAME = "Trust Copilot";

export const ENVIRONMENTS = ["dev", "cert", "prod"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const ACCOUNT_STATES = [
  "raw_signal",
  "candidate_account",
  "qualified_account",
  "contactable",
  "contacted",
  "replied",
  "intake_open",
  "uploaded",
  "fulfilled",
  "offer_sent",
  "paid",
  "activated",
  "blocked",
  "suppressed",
  "snoozed",
] as const;
export type AccountState = (typeof ACCOUNT_STATES)[number];

export const LANES = ["discovery", "qualification", "contact"] as const;
export type Lane = (typeof LANES)[number];

export const LANE_COLORS: Record<Lane, string> = {
  discovery: "var(--color-syntax-builtin)",
  qualification: "var(--color-syntax-keyword)",
  contact: "var(--color-syntax-operator)",
};

export const STATE_COLORS: Record<string, string> = {
  raw_signal: "#569cd6",
  candidate_account: "#569cd6",
  qualified_account: "#c586c0",
  contactable: "#c586c0",
  contacted: "#ce9178",
  replied: "#ce9178",
  intake_open: "#4ec9b0",
  uploaded: "#4ec9b0",
  fulfilled: "#4ec9b0",
  offer_sent: "#dcdcaa",
  paid: "#2ea043",
  activated: "#2ea043",
  blocked: "#f85149",
  suppressed: "#f85149",
  snoozed: "#d29922",
};

export const SENDING_DOMAINS = {
  outreach: "go.trustcopilot.com",
  transactional: "app.trustcopilot.com",
  certOutreach: "cert.go.trustcopilot.com",
  certTransactional: "cert.app.trustcopilot.com",
} as const;
