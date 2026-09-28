import { NextRequest, NextResponse } from 'next/server';
import {
  LOCATIONS,
  LocationId,
  haversineDistanceMiles,
  getDeliveryFeeByDistance,
  calculateServiceFee,
  extractUKOutcode,
  getDeliveryTier,
} from '@/config/shopConfig';

interface QuoteRequest {
  postcode: string;
  branchId: LocationId;
  subtotal?: number;
}

/**
 * POST /api/delivery/quote
 *
 * Resolves a UK postcode to lat/lng via Postcodes.io, computes straight-line
 * distance to the branch, and returns the matching delivery fee tier.
 *
 * Falls back to outcode-based lookup if geocoding fails.
 */
export async function POST(req: NextRequest) {
  try {
    const body: QuoteRequest = await req.json();
    let { postcode, branchId, subtotal } = body;
    branchId = branchId?.toLowerCase() as LocationId;

    if (!postcode || !branchId) {
      return NextResponse.json(
        { error: 'Missing postcode or branchId' },
        { status: 400 }
      );
    }

    const loc = LOCATIONS[branchId];
    if (!loc) {
      return NextResponse.json(
        { error: `Unknown branch: ${branchId}` },
        { status: 400 }
      );
    }

    // Geocode via Postcodes.io (free, no API key, no rate limit for reasonable use)
    const clean = postcode.replace(/\s+/g, '').toUpperCase();
    let geo;
    try {
      const geocodeRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (geocodeRes.ok) {
        geo = await geocodeRes.json();
      }
    } catch (fetchErr) {
      console.warn('[delivery/quote] postcodes.io fetch failed, falling back to outcode', fetchErr);
    }

    if (geo && geo.status === 200 && geo.result) {
      const { latitude, longitude } = geo.result;
      const miles = haversineDistanceMiles(
        loc.coords.lat, loc.coords.lng,
        latitude, longitude
      );

      const tier = getDeliveryFeeByDistance(miles, branchId);

      if (!tier.eligible) {
        return NextResponse.json({
          method: 'distance',
          postcode: geo.result.postcode,
          outcode: geo.result.outcode,
          miles: Math.round(miles * 100) / 100,
          eligible: false,
          deliveryFee: 0,
          freeThreshold: 0,
          minOrder: loc.delivery.minOrder,
          serviceFee: 0,
          reason: tier.reason,
        });
      }

      const serviceFee = subtotal ? calculateServiceFee(subtotal, branchId) : 0;
      const isFree = subtotal ? subtotal >= tier.freeThreshold : false;

      return NextResponse.json({
        method: 'distance',
        postcode: geo.result.postcode,
        outcode: geo.result.outcode,
        miles: Math.round(miles * 100) / 100,
        eligible: true,
        deliveryFee: isFree ? 0 : tier.fee,
        freeThreshold: tier.freeThreshold,
        minOrder: tier.minOrder,
        serviceFee,
        estimatedMinutes: loc.delivery.estimatedMinutes.delivery,
        reason: tier.reason,
      });
    }

    // Fallback: outcode-based lookup
    const fallback = getDeliveryTier(postcode, branchId);
    if (fallback.isValid && fallback.tier) {
      const serviceFee = subtotal ? calculateServiceFee(subtotal, branchId) : 0;
      const isFree = subtotal ? subtotal >= fallback.tier.freeDeliveryThreshold : false;
      return NextResponse.json({
        method: 'outcode',
        postcode: clean,
        outcode: fallback.outcode,
        eligible: true,
        deliveryFee: isFree ? 0 : fallback.tier.fee,
        freeThreshold: fallback.tier.freeDeliveryThreshold,
        minOrder: fallback.tier.minOrder,
        serviceFee,
        estimatedMinutes: { min: fallback.tier.estimatedMinutes, max: fallback.tier.estimatedMinutes + 10 },
        areaName: fallback.tier.areaName,
      });
    }

    return NextResponse.json({
      method: 'outcode',
      postcode: clean,
      outcode: extractUKOutcode(clean),
      eligible: false,
      deliveryFee: 0,
      freeThreshold: 0,
      minOrder: loc.delivery.minOrder,
      serviceFee: 0,
      reason: fallback.reason || 'Delivery not available for this postcode.',
    });
  } catch (err) {
    console.error('[delivery/quote]', err);
    return NextResponse.json(
      { error: 'Failed to calculate delivery quote' },
      { status: 500 }
    );
  }
}
