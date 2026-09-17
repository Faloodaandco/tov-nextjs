import { SHOP_CONFIG } from '@/config/shopConfig';
import tovMenuData from '@/data/tov-menu.json';
import tovMenuSloughData from '@/data/tov-menu-slough.json';
import type { MenuItem } from '@/types';

function getFallbackMenu(): MenuItem[] {
  if (typeof window !== 'undefined' && SHOP_CONFIG.tenant_id === 'f0b00da2-4444-4444-4444-000000000005') {
    return tovMenuSloughData as MenuItem[];
  }
  return tovMenuData as MenuItem[];
}

export async function fetchLiveMenu(): Promise<MenuItem[]> {
  return getFallbackMenu();
}
