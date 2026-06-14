import type { RouteConfig } from "./types";

export const PUBLIC_ROUTES_CONFIG: Record<string, RouteConfig> = {
  BROWSE: {
    path: "/browse",
    label: "Browse",
    privileges: [],
    description: "Browse available items",
  },
  LIST_ITEM: {
    path: "/list-item",
    label: "List Item",
    privileges: [],
    description: "List a new item",
  },
  EDIT_ITEM: {
    path: "/edit-item/[id]",
    label: "Edit Item",
    privileges: [],
    description: "Edit an item",
  },
  ITEM_DETAIL: {
    path: "/item/[id]",
    label: "Item Detail",
    privileges: [],
    description: "View item details",
  },
};

export const PAYMENT_ROUTES_CONFIG: Record<string, RouteConfig> = {
  SUCCESS: {
    path: "/payment/success",
    label: "Payment Success",
    privileges: [],
    description: "Payment successful page",
  },
  CANCEL: {
    path: "/payment/cancel",
    label: "Payment Canceled",
    privileges: [],
    description: "Payment canceled page",
  },
};

export const PUBLIC_ROUTES_ARRAY = [
  ...Object.values(PUBLIC_ROUTES_CONFIG),
  ...Object.values(PAYMENT_ROUTES_CONFIG),
];
