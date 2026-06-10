export interface TenancyInvitationResponse {
  assetId: number;
  assetTitle: string;
  createdAt: string;
}

export interface TenancyRequestResponse {
  assetId: number;
  assetTitle: string;
  requesterUserId: number;
  requesterName: string;
  createdAt: string;
}

export interface TenantListItemResponse {
  tenantUserId: number;
  tenantName: string;
  tenantEmail: string;
  assetId: number;
  assetTitle: string;
}
