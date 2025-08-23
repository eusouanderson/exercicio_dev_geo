export interface Address {
  town?: string;
  state?: string;
  region?: string;
  country?: string;
  postcode?: string;
  country_code?: string;
  municipality?: string;
  city_district?: string;
  ISO3166_2_lvl4?: string;
  state_district?: string;
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
