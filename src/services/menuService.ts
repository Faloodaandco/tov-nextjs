import { MenuItem } from '@/types';
import tovMenuData from '@/data/tov-menu.json';
import tovMenuSloughData from '@/data/tov-menu-slough.json';

export type LocationId = 'hayes' | 'slough';

export const getMenuItems = (locationId: LocationId = 'hayes'): MenuItem[] => {
  if (locationId === 'slough') {
    return tovMenuSloughData as MenuItem[];
  }
  return tovMenuData as MenuItem[];
};

export const getMenuItemById = (id: string, locationId: LocationId = 'hayes'): MenuItem | undefined => {
  const items = getMenuItems(locationId);
  return items.find(item => item.id === id);
};

export const getCategories = (locationId: LocationId = 'hayes'): string[] => {
  const items = getMenuItems(locationId);
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories);
};
