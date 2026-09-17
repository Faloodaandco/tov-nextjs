import { MenuItem, BuilderConfig } from '@/types';
import tovMenuData from '@/data/tov-menu.json';

// FULL PRODUCTION MENU
export const MENU_ITEMS: MenuItem[] = tovMenuData as unknown as MenuItem[];

export const BUILDER_CONFIG: BuilderConfig = {
  basePrice: 6.99,

  bases: [
    { id: 'b1', name: 'Rabri Milk', price: 0, description: 'Our signature slow-cooked sweetened milk — the traditional taste-of-village foundation', tag: 'Traditional' },
  ],

  noodles: [
    { id: 'n1', name: 'With Taste of Village Noodles', price: 0, description: 'Traditional thin cornstarch vermicelli', tag: 'Traditional' },
    { id: 'n2', name: 'Without Noodles', price: 0, description: 'Skip the noodles for a smoother texture' },
  ],

  syrups: [
    { id: 's1', name: 'Rooh Afza', price: 0, description: 'The iconic rose syrup — sweet, floral, unmistakably taste-of-village', tag: 'Traditional' },
    { id: 's2', name: 'No Syrup', price: 0, description: 'Let the Rabri milk and ice cream shine on their own' },
    { id: 's3', name: 'Pistachio Syrup', price: 0.50, description: 'Nutty, fragrant green drizzle', tag: 'Premium' },
    { id: 's4', name: 'Mango Syrup', price: 0.50, description: 'Sweet Alphonso-inspired tropical burst' },
    { id: 's5', name: 'Saffron Syrup', price: 1.00, description: 'Luxurious kesar-infused golden syrup', tag: 'Premium' },
  ],

  scoops: [
    { id: 'ic1', name: 'Malai Kulfi', price: 0, description: 'Dense, slow-cooked traditional frozen dessert — the authentic choice', tag: 'Traditional Kulfi' },
    { id: 'ic3', name: 'Pistachio Ice Cream', price: 0, description: 'Creamy pistachio-flavoured regular ice cream', tag: 'Ice Cream' },
    { id: 'ic4', name: 'Mango Ice Cream', price: 0, description: 'Sweet mango-flavoured regular ice cream', tag: 'Ice Cream' },
    { id: 'ic5', name: 'Vanilla Ice Cream', price: 0, description: 'Classic smooth vanilla', tag: 'Ice Cream' },
  ],

  extras: [
    { id: 'e1', name: 'Sabja Seeds', price: 0, description: 'Cooling, gelatinous basil seeds — a taste-of-village signature', tag: 'Traditional' },
    { id: 'e2', name: 'Rose Jelly', price: 0.50, description: 'Soft rose-flavoured jelly cubes' },
    { id: 'e3', name: 'Mango Jelly', price: 0.50, description: 'Sweet mango-flavoured jelly cubes' },
    { id: 'e4', name: 'Strawberry Jelly', price: 0.50, description: 'Fresh strawberry-flavoured jelly cubes' },
  ],

  toppings: [
    { id: 't1', name: 'Crushed Pistachios', price: 0.50, description: 'Crunchy pistachio shards', tag: 'Popular' },
    { id: 't2', name: 'Sliced Almonds', price: 0.50, description: 'Toasted almond flakes' },
    { id: 't3', name: 'Dried Rose Petals', price: 0.50, description: 'Fragrant edible rose petals' },
    { id: 't4', name: 'Tutti Frutti', price: 0.50, description: 'Colourful candied fruit pieces' },
    { id: 't5', name: 'Edible Gold Dust', price: 2.00, description: 'Pure 24k edible gold — for the ultimate luxury taste-of-village', tag: 'Luxury' },
    { id: 't6', name: 'Vermicelli Crunch', price: 0.50, description: 'Crispy fried vermicelli topping' },
  ]
};

// ─── Chaat Builder Config ───
export interface ChaatBuilderConfig {
  basePrice: number;
  bases: { id: string; name: string; price: number; description: string; emoji: string }[];
  toppings: { id: string; name: string; price: number; description: string; emoji: string; default?: boolean; locked?: boolean }[];
  chutneys: { id: string; name: string; price: number; description: string; emoji: string; default?: boolean; locked?: boolean }[];
}

export const CHAAT_BUILDER_CONFIG: ChaatBuilderConfig = {
  basePrice: 6.49,
  bases: [
    { id: 'cb1', name: 'Samosa Chaat', price: 0, description: 'Crispy samosa pieces crushed and loaded with toppings', emoji: '🥟' },
    { id: 'cb2', name: 'Papri Chaat', price: 0, description: 'Crispy papri wafers layered with chickpeas and yoghurt', emoji: '🫓' },
  ],
  toppings: [
    { id: 'ct1', name: 'Chickpeas', price: 0, description: 'Boiled chana for texture', emoji: '🫘', default: true, locked: true },
    { id: 'ct2', name: 'Diced Onion', price: 0, description: 'Fresh crunchy onion', emoji: '🧅', default: true, locked: true },
    { id: 'ct3', name: 'Tomato', price: 0, description: 'Fresh diced tomato', emoji: '🍅', default: true, locked: true },
    { id: 'ct4', name: 'Yoghurt', price: 0, description: 'Creamy whipped dahi', emoji: '🥛', default: true, locked: true },
    { id: 'ct5', name: 'Pomegranate', price: 0, description: 'Sweet jewel-like seeds', emoji: '💎' },
    { id: 'ct6', name: 'Sev', price: 0, description: 'Crispy thin noodle strands', emoji: '🍜', default: true, locked: true },
    { id: 'ct7', name: 'Fresh Coriander', price: 0, description: 'Fragrant green garnish', emoji: '🌿', default: true, locked: true },
    { id: 'ct8', name: 'Chaat Masala', price: 0, description: 'Tangy spice blend', emoji: '✨', default: true, locked: true },
  ],
  chutneys: [
    { id: 'cc1', name: 'Tamarind Sauce', price: 0, description: 'Sweet and tangy brown sauce', emoji: '🟤', default: true },
    { id: 'cc2', name: 'Chilli Mint Sauce', price: 0, description: 'Spicy green sauce', emoji: '🟢', default: true },
    { id: 'cc4', name: 'Chilli Sauce', price: 0, description: 'Fiery hot red drizzle', emoji: '🔴' },
    { id: 'cc3', name: 'Mint Yoghurt', price: 0, description: 'Cool raita drizzle', emoji: '🫗' },
  ],
};

// ─── Breakfast Builder Config ───
export interface BreakfastBuilderConfig {
  basePrice: number;
  bases: { id: string; name: string; price: number; description: string; emoji: string }[];
  eggs: { id: string; name: string; price: number; description: string; emoji: string }[];
  breads: { id: string; name: string; price: number; description: string; emoji: string }[];
  addons: { id: string; name: string; price: number; description: string; emoji: string }[];
  removals: { id: string; name: string; price: number; description: string; emoji: string }[];
}

export const BREAKFAST_BUILDER_CONFIG: BreakfastBuilderConfig = {
  basePrice: 8.95,
  bases: [
    { id: 'bb1', name: 'Full English', price: 3.00, description: '2 sausages, 2 Beef Bacon (Halal) rashers, 2 eggs, 2 hash browns, grilled tomatoes, mushrooms, baked beans.', emoji: '🍳' },
    { id: 'bb2', name: 'Full Vegetarian', price: 0, description: 'Veggie sausage, hash browns, beans, mushrooms', emoji: '🌱' },
    { id: 'bb3', name: 'Egg Shakshuka', price: 0, description: 'Eggs poached in a spiced tomato and pepper sauce', emoji: '🥘' },
    { id: 'bb4', name: 'Build from Scratch', price: -3.00, description: 'Start with just your eggs and bread', emoji: '🛠️' },
  ],
  eggs: [
    { id: 'be1', name: 'Fried Eggs', price: 0, description: 'Sunny side up', emoji: '🍳' },
    { id: 'be2', name: 'Scrambled Eggs', price: 0, description: 'Soft and buttery', emoji: '🥣' },
    { id: 'be3', name: 'Poached Eggs', price: 0, description: 'Classic soft poach', emoji: '🥚' },
    { id: 'be4', name: 'Omelette', price: 0, description: 'Plain folded omelette', emoji: '🥞' },
  ],
  breads: [
    { id: 'bbd1', name: 'White Toast', price: 0, description: 'Buttered slice', emoji: '🍞' },
    { id: 'bbd2', name: 'Brown Toast', price: 0, description: 'Buttered slice', emoji: '🍞' },
    { id: 'bbd5', name: 'No Bread', price: 0, description: 'Keep it low-carb', emoji: '❌' },
  ],
  addons: [
    { id: 'ba1', name: 'Extra Sausage', price: 1.00, description: 'One extra premium sausage', emoji: '🌭' },
    { id: 'ba2', name: 'Hash Brown', price: 1.00, description: 'One extra crispy hash brown', emoji: '🥔' },
    { id: 'ba3', name: 'Smashed Avocado', price: 1.50, description: 'Freshly smashed seasoned avocado', emoji: '🥑' },
    { id: 'ba4', name: 'Extra Beef Bacon (Halal)', price: 1.00, description: 'One extra rasher', emoji: '🥓' },
    { id: 'ba5', name: 'Chana Masala', price: 1.00, description: 'Spiced chickpeas', emoji: '🍛' },
  ],
  removals: [
    { id: 'br1', name: 'No Sausage', price: 0, description: 'Remove sausage', emoji: '🌭' },
    { id: 'br2', name: 'No Beef Bacon', price: 0, description: 'Remove Beef Bacon (Halal)', emoji: '🥓' },
    { id: 'br3', name: 'No Hash Browns', price: 0, description: 'Remove hash browns', emoji: '🥔' },
    { id: 'br4', name: 'No Beans', price: 0, description: 'Remove beans', emoji: '🥫' },
    { id: 'br5', name: 'No Mushrooms', price: 0, description: 'Remove mushrooms', emoji: '🍄' },
    { id: 'br6', name: 'No Tomato', price: 0, description: 'Remove grilled tomato', emoji: '🍅' },
  ]
};
