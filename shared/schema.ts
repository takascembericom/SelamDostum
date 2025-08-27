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
  totalListings: z.number().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  totalRatings: z.number().default(0),
  createdAt: z.date(),
  emailVerified: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  emailVerified: true,
  totalListings: true,
  averageRating: true,
  totalRatings: true,
  isAdmin: true,
});

// Item schema for Firestore
export const itemSchema = z.object({
  id: z.string(),
  itemNumber: z.number().min(500001, "İlan numarası 500001'den başlamalı"),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string(),
  condition: z.enum(['yeni', 'cok_iyi', 'iyi', 'orta', 'kullanilmis']),
  images: z.array(z.string()).min(1).max(5),
  ownerId: z.string(),
  ownerName: z.string(),
  ownerAvatar: z.string().optional(),
  location: z.string(),
  status: z.enum(['pending', 'aktif', 'takas_edildi', 'pasif', 'reddedildi', 'süresi_biten']).default('pending'),
  isPaid: z.boolean().default(false),
  paymentId: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  adminNotes: z.string().optional(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().optional(),
  expireAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertItemSchema = itemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  expireAt: true,
  ownerName: true,
  ownerAvatar: true,
  isPaid: true,
  paymentId: true,
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

// Chat message schema for Firestore
const baseChatMessageSchema = z.object({
  id: z.string(),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  messageType: z.enum(['text', 'image']).default('text'),
  sender: z.enum(['user', 'admin']),
  senderName: z.string().optional(),
  userId: z.string(),
  timestamp: z.any(),
  createdAt: z.date(),
});

export const chatMessageSchema = baseChatMessageSchema.refine(
  (data) => data.text || data.imageUrl,
  "Message must have either text or image"
);

export const insertChatMessageSchema = baseChatMessageSchema.omit({
  id: true,
  createdAt: true,
}).refine(
  (data) => data.text || data.imageUrl,
  "Message must have either text or image"
);

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// User-to-user messaging schema
const baseUserMessageSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  messageType: z.enum(['text', 'image']).default('text'),
  conversationId: z.string(),
  isRead: z.boolean().default(false),
  timestamp: z.any(),
  createdAt: z.date(),
});

export const userMessageSchema = baseUserMessageSchema.refine(
  (data) => data.text || data.imageUrl,
  "Message must have either text or image"
);

export const insertUserMessageSchema = baseUserMessageSchema.omit({
  id: true,
  createdAt: true,
}).refine(
  (data) => data.text || data.imageUrl,
  "Message must have either text or image"
);

export type UserMessage = z.infer<typeof userMessageSchema>;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;

// User Rating schema
export const userRatingSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  tradeOfferId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserRatingSchema = userRatingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserRating = z.infer<typeof userRatingSchema>;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['new_rating', 'trade_offer', 'trade_accepted', 'trade_rejected', 'trade_completed', 'admin_message']),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
});

export const insertNotificationSchema = notificationSchema.omit({
  id: true,
  createdAt: true,
});

export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Conversation schema
const baseConversationSchema = z.object({
  id: z.string(),
  participants: z.array(z.string()).length(2),
  lastMessage: z.string(),
  lastMessageTime: z.date(),
  unreadCount: z.record(z.string(), z.number()),
  tradeOfferId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const conversationSchema = baseConversationSchema;

export const insertConversationSchema = baseConversationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Categories for items
export const ITEM_CATEGORIES = [
  'beyaz_esya',
  'mobilya',
  'araba_yedek_parca',
  'araba',
  'teknolojik_urunler',
  'ev_beyaz_esya',
  'oyuncak',
  'tasinmazlar',
  'kitap'
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
  'tasinmazlar': 'Taşınmazlar',
  'kitap': 'Kitap'
} as const;

// Sub-categories for Taşınmazlar
export const TASINMAZLAR_SUBCATEGORIES = {
  'ev': 'Ev',
  'arsa': 'Arsa',
  'tarla': 'Tarla'
} as const;

// Turkish cities
export const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
] as const;

// Car brands
export const CAR_BRANDS = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroën', 'Fiat',
  'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Dacia',
  'Skoda', 'SEAT', 'Volvo', 'Saab', 'Alfa Romeo', 'Lancia', 'Jaguar', 'Land Rover', 'Mini', 'Smart',
  'Porsche', 'Aston Martin', 'Bentley', 'Rolls-Royce', 'Ferrari', 'Lamborghini', 'Maserati', 'McLaren',
  'Tofaş', 'Karsan', 'Otokar', 'BMC', 'Temsa', 'Isuzu', 'Iveco', 'MAN', 'Scania', 'Volvo Trucks',
  'Diğer'
] as const;
