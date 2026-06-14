export interface AddressDetails {
  localAddress?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type AssetStatus = "AVAILABLE" | "OCCUPIED" | "REPAIRING" | "INACTIVE";

export interface AssetListItem {
  id: number;
  title: string;
  rent: number;
  capacity: number;
  categoryName: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  // Extended fields — populated when the API returns them
  status?: AssetStatus | null;
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

export interface AssetDetailResponse {
  id: number;
  title: string;
  description: string | null;
  categoryName: string | null;
  capacity: number;
  rent: number;
  tags: string[] | null;
  createdAt: string;
  imageKeys: string[] | null;
  imageUrls: string[] | null;
  addressDetails: AddressDetails | null;
}

export interface CreateAssetRequest {
  title: string;
  description?: string;
  categoryId?: number;
  capacity?: number;
  rent?: number;
  tags?: string[];
  addressDetails: AddressDetails;
}
