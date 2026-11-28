import type { CommerceProduct, CommerceState } from "@nexora/commerce";

export type CategoryId = "bazar" | "bolsos";

export type ArtKind = "jarra" | "cocina" | "mate" | "vasos" | "bolso" | "cartera" | "rinonera" | "billetera";

export interface Product extends CommerceProduct {
  category: CategoryId;
  /** Precio anterior, para mostrar descuento */
  compareAt?: number;
  featured: boolean;
  /** Foto real (ruta en /public). Si no hay, se usa la ilustración. */
  image?: string;
  /** Recorte de la foto para esconder los textos sobreimpresos del PDF */
  imagePosition?: string;
  art: ArtKind;
  description: string;
  illustrativePrice: boolean;
}

export type { DeliveryMethod, PaymentMethod, OrderStatus, OrderLine, Order, Settings } from "@nexora/commerce";
export interface Content {
  announcement: string;
  heroTitle: string;
  heroText: string;
  heroCta: string;
  bandTitle: string;
  address: string;
  city: string;
  hours: string;
  instagram: string;
  whatsapp: string;
}

export interface StoreState extends CommerceState<Product> {
  version: number;
  content: Content;
}
