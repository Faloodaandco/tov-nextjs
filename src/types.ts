export interface MenuSize {
  name: string;
  price: number;
  dineInPrice?: number;
}

export interface MenuModifierGroup {
  name: string;
  required?: boolean;
  options: {
    name: string;
    price: number;
    dineInPrice?: number;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  dineInPrice?: number;
  originalPrice?: number;
  category: string;
  image: string;
  popular?: boolean;
  is86d?: boolean;
  showOnPos?: boolean;
  showOnWebsite?: boolean;
  onlinePrice?: number;
  sizes?: MenuSize[];
  modifierGroups?: MenuModifierGroup[];
  dietary?: ('vegan' | 'vegetarian' | 'halal' | 'gluten-free' | 'spicy')[];
}

export interface MenuCategory {
  id: string;
  name?: string;
  products: MenuItem[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  modifiers?: Record<string, string>;
  _cartKey?: string;
  notes?: string;
  course?: 'Starter' | 'Main' | 'Dessert' | 'Drinks';
  course_status?: 'holding' | 'fired';
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  type: 'delivery' | 'collection' | 'dine-in' | 'takeaway';
  items: CartItem[];
  total: number;
  tenant_id?: string;
  location?: string;
  status: 'web_holding' | 'pending' | 'preparing' | 'partial_ready' | 'ready' | 'completed' | 'no_show' | 'refunded' | 'payment_pending';
  timestamp: Date & { seconds?: number; nanoseconds?: number };
  tableNumber?: string;
  table_number?: number;
  provider?: string;
  isPaid?: boolean;
  isKitchenFire?: boolean;
  paymentMethod?: 'cash' | 'card' | 'unpaid' | 'split' | string;
  amountPaid?: number;
  splitDetails?: { cash: number; card: number };
  notes?: string;
  source?: 'Web' | 'POS' | 'NFC';
  payment_status?: 'paid' | 'unpaid';
  appliedReward?: Reward | null;
  createdAt?: Date;
  updatedAt?: Date;
  driverName?: string;
  waiterName?: string;
  marketingOptIn?: boolean;
  stripePaymentIntentId?: string;
  prepDurationSeconds?: number;
  kitchen_metrics?: {
    prepDurationSeconds: number;
    staffId: string;
    staffName: string;
    stationBumping: string;
    itemCount: number;
  };
  station_status?: {
    front?: 'ready' | 'pending';
    back?: 'ready' | 'pending';
  };
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED' | 'NO_SHOW' | 'pending' | 'confirmed' | 'cancelled';
  tableId?: string;
  name?: string;
  phone?: string;
  customerEmail?: string;
  tenantId?: string;
}

export interface BuilderOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  tag?: string;
}

export interface BuilderConfig {
  basePrice: number;
  bases: BuilderOption[];
  noodles: BuilderOption[];
  syrups: BuilderOption[];
  scoops: BuilderOption[];
  extras: BuilderOption[];
  toppings: BuilderOption[];
}

export type ViewMode = 'customer' | 'admin';

export interface Reward {
  id: string;
  type: 'free_item' | 'discount_percent' | 'discount_fixed';
  itemName?: string;
  category?: string;
  value?: number;
  reason: string;
  status: 'available' | 'redeemed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  redeemedOrderId?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  points?: number;
  itemCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  rewards: Reward[];
  qrCode?: string;
  joinedAt: Date;
  lastOrderAt: Date;
  marketingOptIn?: boolean;
  birthday?: { month: number; day: number };
  birthdayRewardYear?: number;
}

export interface RewardRule {
  id: string;
  type: 'item_milestone' | 'category_milestone' | 'spend_milestone';
  category?: string;
  threshold: number;
  rewardType: 'free_item' | 'discount_percent' | 'discount_fixed';
  rewardValue?: number;
  description: string;
  active: boolean;
}
