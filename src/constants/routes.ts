import { ROLE_ID } from "./role-definitions";

export const ROUTES = [
  { path: "/login",            label: "Login",            privileges: [] },
  { path: "/register",         label: "Register",         privileges: [] },
  { path: "/get-started",      label: "Get Started",      privileges: [] },
  { path: "/list-item",        label: "List Item",        privileges: [] },
  { path: "/edit-item/[id]",   label: "Edit Item",        privileges: [ROLE_ID.ADMIN] },
  { path: "/item/[id]",        label: "Item Detail",      privileges: [] },
  { path: "/payment/success",  label: "Payment Success",  privileges: [] },
  { path: "/payment/cancel",   label: "Payment Canceled", privileges: [] },

  { path: "/dashboard",                  label: "Dashboard",        privileges: [ROLE_ID.SUPER_ADMIN, ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/payments",         label: "Payments",         privileges: [ROLE_ID.ADMIN] },
  { path: "/dashboard/payment-options",  label: "Payment Options",  privileges: [ROLE_ID.ADMIN] },
  { path: "/dashboard/payment-history",  label: "Payment History",  privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/profile",          label: "Profile",          privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/listings",         label: "Listings",         privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/requests",         label: "Requests",         privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/messages",         label: "Messages",         privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/notifications",    label: "Notifications",    privileges: [ROLE_ID.ADMIN, ROLE_ID.TENANT] },
  { path: "/dashboard/invitations",      label: "Invitations",      privileges: [ROLE_ID.TENANT] },
  { path: "/dashboard/tenants",          label: "Tenants",          privileges: [ROLE_ID.ADMIN]},
  { path: "/dashboard/audits",           label: "Audits",           privileges: [ROLE_ID.SUPER_ADMIN] },
] as const;

export type Route = typeof ROUTES[number];
