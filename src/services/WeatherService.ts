import { LocationId } from '@/config/shopConfig';

export interface WeatherDiscountResult {
  trigger: boolean;
  reason: string;
  suggestedDiscount: number;
}

// NOTE: OPENWEATHER_API_KEY must be set in your .env file
// e.g. OPENWEATHER_API_KEY=your_api_key_here

const BRANCH_COORDS = {
  hayes: { lat: 51.5127, lon: -0.4214 },
  slough: { lat: 51.5084, lon: -0.5951 },
};

export async function shouldTriggerWeatherDiscount(branch: LocationId): Promise<WeatherDiscountResult> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY is not set. Weather discount check bypassed.');
    return { trigger: false, reason: 'API_KEY_MISSING', suggestedDiscount: 0 };
  }

  const coords = BRANCH_COORDS[branch];
  if (!coords) {
    return { trigger: false, reason: 'INVALID_BRANCH', suggestedDiscount: 0 };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`OpenWeather API returned ${res.status}`);
    }

    const data = await res.json();
    const temp = data.main?.temp;
    const weatherList = data.weather || [];
    const conditionIds = weatherList.map((w: any) => w.id);

    // Weather condition codes (https://openweathermap.org/weather-conditions)
    // 2xx Thunderstorm, 3xx Drizzle, 5xx Rain, 6xx Snow
    const isRainingOrSnowing = conditionIds.some((id: number) => 
      (id >= 200 && id < 600) || (id >= 600 && id < 700)
    );

    if (isRainingOrSnowing) {
      return {
        trigger: true,
        reason: 'Rainy or snowy weather detected. 10% off pickup.',
        suggestedDiscount: 10
      };
    }

    if (temp !== undefined && temp < 5) {
      return {
        trigger: true,
        reason: 'Very cold weather detected (<5°C). 15% off hot drinks.',
        suggestedDiscount: 15
      };
    }

    if (temp !== undefined && temp > 28) {
      return {
        trigger: true,
        reason: 'Very hot weather detected (>28°C). 10% off cold drinks.',
        suggestedDiscount: 10
      };
    }

    return { trigger: false, reason: 'Normal weather conditions.', suggestedDiscount: 0 };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { trigger: false, reason: 'ERROR_FETCHING_WEATHER', suggestedDiscount: 0 };
  }
}
