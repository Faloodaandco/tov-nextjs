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
