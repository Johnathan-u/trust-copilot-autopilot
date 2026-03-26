import {
  Search,
  Users,
  Mail,
  Inbox,
  Shield,
  BarChart3,
  Settings,
  GraduationCap,
  Wrench,
  Globe,
  FileCheck,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Pipeline",
    items: [
      {
        label: "Discovery",
        href: "/app/discovery",
        icon: Search,
        children: [
          { label: "Dashboard", href: "/app/discovery" },
          { label: "Sources", href: "/app/discovery/sources" },
          { label: "Signals", href: "/app/discovery/signals" },
          { label: "Source Health", href: "/app/discovery/source-health" },
          { label: "Budgets", href: "/app/discovery/budgets" },
        ],
      },
      {
        label: "Accounts",
        href: "/app/accounts",
        icon: Users,
        children: [
          { label: "Pipeline", href: "/app/accounts" },
        ],
      },
      {
        label: "Outreach",
        href: "/app/outreach/budgets",
        icon: Mail,
        children: [
          { label: "Send Budgets", href: "/app/outreach/budgets" },
        ],
      },
      {
        label: "Inbox",
        href: "/app/inbox",
        icon: Inbox,
        children: [
          { label: "Threads", href: "/app/inbox" },
          { label: "Queues", href: "/app/inbox/queues" },
          { label: "Alerts", href: "/app/inbox/alerts" },
          { label: "Engagement", href: "/app/inbox/engagement" },
        ],
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Learning",
        href: "/app/learning/labels",
        icon: GraduationCap,
        children: [
          { label: "Labels", href: "/app/learning/labels" },
          { label: "Evaluations", href: "/app/learning/evals" },
          { label: "Shadow Scores", href: "/app/learning/shadow" },
        ],
      },
      {
        label: "Analytics",
        href: "/app/analytics/deliverability",
        icon: BarChart3,
        children: [
          { label: "Deliverability", href: "/app/analytics/deliverability" },
          { label: "Revenue Funnel", href: "/app/analytics/revenue" },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Ops Console",
        href: "/app/ops",
        icon: Wrench,
        children: [
          { label: "Incidents", href: "/app/ops" },
          { label: "Change Log", href: "/app/ops/changes" },
          { label: "Runbooks", href: "/app/ops/runbooks" },
        ],
      },
      {
        label: "Settings",
        href: "/app/settings/sending-domains",
        icon: Settings,
        children: [
          { label: "Sending Domains", href: "/app/settings/sending-domains" },
          { label: "Mailboxes", href: "/app/settings/mailboxes" },
          { label: "Compliance", href: "/app/settings/compliance" },
          { label: "Suppression", href: "/app/settings/suppression" },
          { label: "Policy Simulator", href: "/app/settings/policy-simulator" },
        ],
      },
    ],
  },
];

export const publicRoutes = [
  { label: "Trust Room", href: "/r/[token]", icon: Shield },
  { label: "Proof Viewer", href: "/proof/[token]", icon: FileCheck },
  { label: "Offers", href: "/offer/[offerId]", icon: CreditCard },
  { label: "Workspace", href: "/workspace", icon: LayoutDashboard },
  { label: "Onboarding", href: "/app/onboarding", icon: Globe },
];
