import { NextRequest, NextResponse } from 'next/server';
import { LOCATIONS, type LocationId } from '@/config/shopConfig';

interface KitchenStatusResponse {
  branchId: LocationId;
  isOpen: boolean;
  isLastOrders: boolean;
  message: string;
  minutesUntilClose?: number;
  prepEstimateMinutes: { min: number; max: number };
  closingTime?: string;
  openingTime?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const branch = (searchParams.get('branch') || 'hayes') as LocationId;
  const loc = LOCATIONS[branch] || LOCATIONS.hayes;

  // Use current London time
  const nowLondon = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })
  );

  const currentHour = nowLondon.getHours();
  const currentMinute = nowLondon.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute; // minutes from midnight

  // TOV Operating Schedule: 09:00 AM to 01:30 AM (next day)
  // 09:00 is 540 min. 01:30 AM next day is 90 min (01:30).
  // Between 01:30 AM (90) and 09:00 AM (540) the kitchen is closed.
  const isNightClosed = currentTimeVal >= 90 && currentTimeVal < 540;
  const isOpen = !isNightClosed;

  let isLastOrders = false;
  let minutesUntilClose = 0;
  let message = 'Kitchen Open & Preparing Hot Orders';

  if (isOpen) {
    // If between 00:30 and 01:30 (next morning), we are in the last 60 minutes
    if (currentTimeVal >= 30 && currentTimeVal < 90) {
      minutesUntilClose = 90 - currentTimeVal;
      isLastOrders = minutesUntilClose <= 45;
      message = `Last Orders! Kitchen closes in ${minutesUntilClose} mins`;
    } else if (currentTimeVal >= 1410) {
      // 23:30 to 24:00 (midnight is 1440 min)
      minutesUntilClose = (1440 - currentTimeVal) + 90; // mins until 01:30
      message = `Open — Kitchen closing at 01:30 AM (${minutesUntilClose}m left)`;
    } else {
      message = 'Kitchen Open — Fresh Karahi & Tandoor Active';
    }
  } else {
    message = 'Kitchen Closed — Opens today at 10:00 AM for pre-orders';
  }

  const response: KitchenStatusResponse = {
    branchId: branch,
    isOpen,
    isLastOrders,
    message,
    minutesUntilClose: isOpen ? minutesUntilClose : undefined,
    prepEstimateMinutes: isOpen
      ? isLastOrders
        ? { min: 25, max: 35 }
        : { min: 20, max: 25 }
      : { min: 0, max: 0 },
    closingTime: '01:30 AM',
    openingTime: '10:00 AM',
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
