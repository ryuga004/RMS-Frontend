export interface UserResponse {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface AddressResponse {
  localAddress?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  phoneNo: string | null;
  isVerified: boolean;
  createdAt: string;
  profileImageUrl: string | null;
  address: AddressResponse | null;
}
