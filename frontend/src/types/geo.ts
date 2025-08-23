// src/types/geo.ts

export interface Address {
  town?: string;
  state?: string;
  region?: string;
  country?: string;
  postcode?: string;
  country_code?: string;
  municipality?: string;
  city_district?: string;
  // Adicione outros campos que possam existir, como 'ISO3166-2-lvl4'
  [key: string]: any;
}

export interface Info {
  lat?: string;
  lon?: string;
  address?: Address;
  display_name?: string;
  type?: string;
  [key: string]: any;
}

export interface GeoPoint {
  id?: number;
  lat: string;
  lon: string;
  info: Info;
}
