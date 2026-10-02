export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  price: number | null;
  ratingGabriel: number | null;
  ratingMilena: number | null;
  averageRating: number | null;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  logoUrl: string | null;
  priceLevel: number | null;
  scoreFood: number | null;
  scoreService: number | null;
  scoreAmbience: number | null;
  scoreCleanliness: number | null;
  scoreComfort: number | null;
  scoreValue: number | null;
  scoreWait: number | null;
  averageRating: number | null;
  review: string | null;
  visitedAt: string | null;
  wouldReturn: boolean;
  dishCount: number;
  dishes: Dish[];
}

export type RestaurantInput = Omit<Restaurant, 'id' | 'averageRating' | 'dishCount' | 'dishes'>;

export type DishInput = Pick<
  Dish,
  'name' | 'description' | 'photoUrl' | 'price' | 'ratingGabriel' | 'ratingMilena'
>;

export type ScoreKey =
  | 'scoreFood'
  | 'scoreService'
  | 'scoreAmbience'
  | 'scoreCleanliness'
  | 'scoreComfort'
  | 'scoreValue'
  | 'scoreWait';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ManagedUser extends User {
  twoFactorEnabled: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Enrollment {
  enrollmentToken: string;
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

export interface AnalyticsSummary {
  days: number;
  includeAdmin: boolean;
  totals: { pageviews: number; clicks: number; visitors: number };
  daily: Array<{ day: string; pageviews: number; visitors: number }>;
  pages: Array<{ path: string; views: number; visitors: number }>;
  clicks: Array<{ target: string; path: string; clicks: number }>;
  countries: Array<{ country: string; visitors: number }>;
  cities: Array<{
    city: string;
    region: string | null;
    country: string | null;
    visitors: number;
    latitude: number;
    longitude: number;
  }>;
  devices: Array<{ label: string; visitors: number }>;
  browsers: Array<{ label: string; visitors: number }>;
  systems: Array<{ label: string; visitors: number }>;
  referrers: Array<{ host: string; visitors: number }>;
  recent: Array<{
    occurredAt: string;
    type: 'pageview' | 'click';
    path: string;
    target: string | null;
    city: string | null;
    country: string | null;
    device: string | null;
  }>;
}

export type SortOption = 'recent' | 'rating' | 'name';

export interface GeocodeSuggestion {
  label: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
}
