export interface VariantAttribute {
  name: string;
  type: string;
  count: number;
  key: string;
  editable: boolean;
  selected: boolean;
  deletable: boolean;
  values: any[];
}

export interface BaseProductSummary {
  name: string;
  category: string;
  descriptions: string;
  photos: {
    url: string;
    rawValue: string;
  }[];
  stock: number;
  price: string;
  currency: string;
  variants: VariantAttribute[];
  type: string;
  cuisineCountry?: string;
  isNationalCuisine?: boolean;
}
