export interface Promo {
  code: string;           // "VILLAGE10"
  name: string;           // "Village Local Resident 10%"
  discountPercent: number; // 10
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  fixedAmountPence?: number;
  branches: ('hayes' | 'slough')[];
  minOrderPence: number;
  maxRedemptions: number;  // Total across all customers
  currentRedemptions: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdBy: string;       // Admin user
}
