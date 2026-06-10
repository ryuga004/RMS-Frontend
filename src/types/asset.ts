export interface AddressDetails {
  localAddress?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface AssetListItem {
  id: number;
  title: string;
  rent: number;
  capacity: number;
  categoryName: string;
  imageKey?: string | null;
  imageUrl?: string | null;
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
