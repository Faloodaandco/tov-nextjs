import { SHOP_CONFIG } from '@/config/shopConfig';
import { MenuItem } from '@/types';
import tovMenuData from '@/data/tov-menu.json';
import tovMenuSloughData from '@/data/tov-menu-slough.json';

export const getMenuItems = (locationId: string = 'camden'): MenuItem[] => {
  if (locationId === 'slough') {
    return tovMenuSloughData as MenuItem[];
  }
  return tovMenuData as MenuItem[];
};

export const getMenuItemById = (id: string, locationId: string = 'camden'): MenuItem | undefined => {
  const items = getMenuItems(locationId);
  return items.find(item => item.id === id);
};

export const getCategories = (locationId: string = 'camden'): string[] => {
  const items = getMenuItems(locationId);
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories);
};
