import crypto from "crypto";

const SQUARE_API_URL = "https://connect.squareup.com";
const SQUARE_VERSION = "2026-07-15";

export class SquareCatalogService {
  /**
   * Helper to fetch all discount objects from Square Catalog
   */
  private static async getDiscounts(token: string) {
    const response = await fetch(`${SQUARE_API_URL}/v2/catalog/list?types=DISCOUNT`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Square API Error (getDiscounts):", errorText);
      throw new Error(`Failed to list discounts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.objects || [];
  }

  /**
   * Helper to upsert a discount object
   */
  private static async upsertDiscount(token: string, name: string, percentage: string) {
    const discounts = await this.getDiscounts(token);
    const existing = discounts.find((d: any) => d.discount_data?.name === name);

    const idempotencyKey = crypto.randomUUID();

    const objectData: any = {
      type: "DISCOUNT",
      id: existing ? existing.id : `#${name.replace(/\s+/g, "_").toLowerCase()}`,
      discount_data: {
        name,
        discount_type: "FIXED_PERCENTAGE",
        percentage,
        pin_required: false,
        modify_tax_basis: "MODIFY_TAX_BASIS",
      },
    };

    if (existing && existing.version) {
      objectData.version = existing.version;
    }

    const response = await fetch(`${SQUARE_API_URL}/v2/catalog/object`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        object: objectData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Square API Error (upsertDiscount ${name}):`, errorText);
      throw new Error(`Failed to upsert discount ${name}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.catalog_object;
  }

  static async upsertBreakfastDiscount(token: string) {
    return this.upsertDiscount(token, "AUTO: BREAKFAST 40% Off", "40.0");
  }

  static async upsertHappyHourDiscount(token: string) {
    return this.upsertDiscount(token, "AUTO: HAPPY HOUR 20% Off", "20.0");
  }

  static async syncAllRules(token: string, locationId: string) {
    console.info(`Syncing catalog rules for location ${locationId}`);
    
    const breakfast = await this.upsertBreakfastDiscount(token);
    const happyHour = await this.upsertHappyHourDiscount(token);
    
    return {
      locationId,
      breakfastDiscountId: breakfast.id,
      happyHourDiscountId: happyHour.id,
    };
  }
}
