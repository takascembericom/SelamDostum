import { z } from "zod";

// User schema for Firestore
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  avatar: z.string().optional(),
  createdAt: z.date(),
  emailVerified: z.boolean().default(false),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  emailVerified: true,
});

// Item schema for Firestore
export const itemSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string(),
  condition: z.enum(['yeni', 'cok_iyi', 'iyi', 'orta', 'kullanilmis']),
  images: z.array(z.string()).min(1).max(5),
  ownerId: z.string(),
  ownerName: z.string(),
  ownerAvatar: z.string().optional(),
  location: z.string(),
  status: z.enum(['aktif', 'takas_edildi', 'pasif']).default('aktif'),
  rating: z.number().min(0).max(5).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertItemSchema = itemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerName: true,
  ownerAvatar: true,
});

// Trade offer schema
export const tradeOfferSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  fromItemId: z.string(),
  toItemId: z.string(),
  message: z.string().optional(),
  status: z.enum(['beklemede', 'kabul_edildi', 'reddedildi', 'iptal_edildi']).default('beklemede'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTradeOfferSchema = tradeOfferSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = z.infer<typeof itemSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type TradeOffer = z.infer<typeof tradeOfferSchema>;
export type InsertTradeOffer = z.infer<typeof insertTradeOfferSchema>;

// Categories for items
export const ITEM_CATEGORIES = [
  'beyaz_esya',
  'mobilya',
  'araba_yedek_parca',
  'araba',
  'teknolojik_urunler',
  'ev_beyaz_esya',
  'oyuncak',
  'tasinmazlar'
] as const;

// Condition labels in Turkish
export const CONDITION_LABELS = {
  'yeni': 'Yeni',
  'cok_iyi': 'Çok İyi',
  'iyi': 'İyi',
  'orta': 'Orta',
  'kullanilmis': 'Kullanılmış'
} as const;

// Category labels in Turkish
export const CATEGORY_LABELS = {
  'beyaz_esya': 'Beyaz Eşya',
  'mobilya': 'Mobilya',
  'araba_yedek_parca': 'Araba Yedek Parça',
  'araba': 'Araba',
  'teknolojik_urunler': 'Teknolojik Ürünler',
  'ev_beyaz_esya': 'Ev Beyaz Eşya',
  'oyuncak': 'Oyuncak',
  'tasinmazlar': 'Taşınmazlar'
} as const;
