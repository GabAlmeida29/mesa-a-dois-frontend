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
  ratingGabriel: number | null;
  ratingMilena: number | null;
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

export interface User {
  id: string;
  name: string;
  email: string;
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
