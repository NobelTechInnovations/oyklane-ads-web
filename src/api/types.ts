// Shapes of API responses. Request bodies are typed from the generated schema.

export type ConfiguredStatus = 'draft' | 'active' | 'paused' | 'archived';
export type Objective = 'sales' | 'traffic' | 'leads' | 'awareness';
export type Ratio = 'square' | 'portrait' | 'landscape' | 'story';
export type CallToAction = 'shop_now' | 'learn_more' | 'sign_up' | 'contact_us' | 'book_now' | 'whatsapp';

export interface Effective {
  state: 'draft' | 'paused' | 'archived' | 'ended' | 'scheduled' | 'in_review' | 'rejected' | 'active';
  reason: string;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  objective: Objective;
  status: ConfiguredStatus;
  spendCap: string | null;
  startsAt: string | null;
  endsAt: string | null;
  effective: Effective;
}

export interface Location {
  type: 'country' | 'state' | 'city' | 'pincode';
  /** Country "IN", state "IN-MH", city "IN-MH:Mumbai", or a PIN code. */
  value: string;
  label?: string;
}

export type AssetFile = 'original' | Ratio | 'thumb';

export interface Audience {
  version: 1;
  locations: Location[];
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'male' | 'female';
  languages: string[];
  interests: string[];
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: ConfiguredStatus;
  budgetType: 'daily' | 'lifetime';
  /** Micros: 1 rupee is 1,000,000. */
  budget: string;
  startsAt: string | null;
  endsAt: string | null;
  audience: Audience;
  bidStrategy: 'auto' | 'cpc_cap' | 'cpm' | 'target_cpa';
  bidAmount: string | null;
  networks: { key: string; budgetPercent: number | null }[];
  effective: Effective;
}

export interface AdContent {
  assetIds: string[];
  headlines: string[];
  primaryText: string;
  description: string;
  cta: CallToAction;
  destinationUrl: string;
  utm: Record<string, string>;
}

export interface Ad {
  id: string;
  adSetId: string;
  name: string;
  status: ConfiguredStatus;
  current: AdContent & { id: string; number: number; reviewState: 'draft' | 'in_review' | 'approved' | 'rejected' };
  liveVersionId: string | null;
  effective: Effective;
}

export interface Crop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AssetIssue {
  network: string;
  severity: 'error' | 'warning';
  field: string;
  message: string;
}

export interface Asset {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  variants: { ratio: Ratio; crop: Crop; width: number; height: number }[];
  archived: boolean;
  updatedAt: string;
  /** Public Azure addresses, or API paths when files are served by the API. */
  urls: Record<AssetFile, string>;
  issues: AssetIssue[];
  usedBy?: { adId: string; adName: string }[];
}

export interface Network {
  key: string;
  name: string;
  minDailyBudget: string;
  maxHeadlines: number;
  headlineMaxLength: number;
  primaryTextMaxLength: number;
  descriptionMaxLength: number;
  maxMedia: number;
  imageRatios: Ratio[];
  minImageSide: number;
  recommendedImageSide: number;
}
