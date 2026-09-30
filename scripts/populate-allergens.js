/**
 * Auto-populate obvious allergens for TOV menu items
 * Based on common Pakistani/Indian restaurant ingredient knowledge
 * 
 * FSA 14 Allergens: celery, cereals, crustaceans, eggs, fish, lupin,
 *                   milk, molluscs, mustard, nuts, peanuts, sesame, soybeans, sulphites
 */
const fs = require('fs');
const path = require('path');

// ── Allergen Rules by dish name pattern ──
// Each rule: { match: RegExp | string[], allergens: string[], confidence: 'high'|'medium' }
const RULES = [
  // ─── Breads (cereals = wheat flour, milk = ghee/butter) ───
  { match: ['naan', 'roti', 'paratha', 'kulcha', 'puri'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat flour base, ghee/butter' },
  { match: ['cheese naan', 'cheese garlic naan', 'cheese stuffed paratha', 'cheese paratha'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat flour + cheese' },
  { match: ['qeema naan', 'keema naan'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat flour, ghee, lamb mince' },
  { match: ['anda paratha'], allergens: ['cereals', 'milk', 'eggs'], confidence: 'high', note: 'Wheat flour, ghee, egg filling' },

  // ─── Paneer dishes (milk = paneer is dairy cheese) ───
  { match: ['paneer'], allergens: ['milk'], confidence: 'high', note: 'Paneer is milk-based cheese' },

  // ─── Dairy-based dishes ───
  { match: ['raita'], allergens: ['milk'], confidence: 'high', note: 'Yoghurt-based' },
  { match: ['lassi'], allergens: ['milk'], confidence: 'high', note: 'Yoghurt drink' },
  { match: ['malai tikka', 'malai boti'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Cream/yoghurt marinade, often cashew paste' },
  { match: ['butter chicken'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Butter, cream, cashew paste' },
  { match: ['qorma', 'korma'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Yoghurt, cream, ground almonds/cashews' },
  { match: ['tikka masala'], allergens: ['milk', 'nuts'], confidence: 'medium', note: 'Cream-based sauce, may contain cashew paste' },

  // ─── Tandoori/BBQ (milk = yoghurt marinade, mustard = mustard oil) ───
  { match: ['tikka', 'tandoori', 'haryali'], allergens: ['milk', 'mustard'], confidence: 'medium', note: 'Yoghurt marinade, may use mustard oil' },
  { match: ['seekh kebab', 'kebab', 'lamb skewer', 'chicken skewer', 'chapli kebab', 'shish kebab', 'gola kebab'], allergens: ['cereals', 'mustard'], confidence: 'medium', note: 'May contain breadcrumbs/gram flour, spice blend with mustard' },
  { match: ['chops'], allergens: ['milk', 'mustard'], confidence: 'medium', note: 'Yoghurt marinade' },
  { match: ['chicken wings'], allergens: ['cereals', 'mustard'], confidence: 'medium', note: 'May be coated, spice rub' },
  { match: ['chicken lollipop'], allergens: ['cereals', 'eggs', 'soybeans'], confidence: 'medium', note: 'Battered/coated, may contain soy sauce' },

  // ─── Fish ───
  { match: ['machli', 'fish', 'seabass'], allergens: ['fish', 'cereals'], confidence: 'high', note: 'Fish, gram/wheat flour coating' },

  // ─── Rice & Biryani ───
  { match: ['biryani', 'pulao'], allergens: ['nuts', 'milk', 'sulphites'], confidence: 'medium', note: 'Often garnished with almonds/cashews, ghee, fried onions may contain sulphites' },
  { match: ['plain rice', 'jeera rice', 'vegetable rice'], allergens: [], confidence: 'high', note: 'Plain rice is generally allergen-free' },
  { match: ['fried rice'], allergens: ['eggs', 'soybeans'], confidence: 'medium', note: 'Egg fried rice, may contain soy sauce' },
  { match: ['egg fried rice'], allergens: ['eggs', 'soybeans'], confidence: 'high', note: 'Contains egg, soy sauce' },

  // ─── Fried/Battered items ───
  { match: ['pakora', 'pakoras'], allergens: ['cereals'], confidence: 'high', note: 'Gram flour batter (check if wheat flour also used)' },
  { match: ['samosa', 'sam-o-say'], allergens: ['cereals'], confidence: 'high', note: 'Wheat flour pastry' },
  { match: ['aloo tikki'], allergens: ['cereals'], confidence: 'medium', note: 'May contain breadcrumbs' },

  // ─── Burgers & Rolls ───
  { match: ['burger'], allergens: ['cereals', 'sesame', 'milk', 'eggs'], confidence: 'medium', note: 'Bun (wheat, sesame seeds), may contain egg/dairy' },
  { match: ['roll'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Roti/paratha wrap (wheat, ghee)' },
  { match: ['noodle', 'noodles'], allergens: ['cereals', 'soybeans', 'eggs'], confidence: 'medium', note: 'Wheat noodles, soy sauce, may contain egg' },
  { match: ['nuggets', 'strips'], allergens: ['cereals', 'eggs', 'milk'], confidence: 'medium', note: 'Breadcrumbed, may contain egg/dairy' },

  // ─── Curries ───
  { match: ['karahi'], allergens: ['mustard'], confidence: 'medium', note: 'Tomato-based, may use mustard oil' },
  { match: ['nihari'], allergens: ['cereals', 'nuts'], confidence: 'medium', note: 'Thickened with wheat flour, spice blend' },
  { match: ['haleem'], allergens: ['cereals', 'nuts'], confidence: 'high', note: 'Contains wheat, barley, lentils, nuts garnish' },
  { match: ['paya'], allergens: ['cereals'], confidence: 'medium', note: 'May be thickened with flour' },

  // ─── Chaats ───
  { match: ['dahi bhalla', 'dahi'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Lentil fritters in yoghurt' },
  { match: ['papri chaat'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat flour crisps, yoghurt' },
  { match: ['sev puri'], allergens: ['cereals', 'peanuts'], confidence: 'medium', note: 'Wheat puri, gram flour sev, may contain peanuts' },
  { match: ['gol gappe'], allergens: ['cereals'], confidence: 'high', note: 'Semolina/wheat puri' },
  { match: ['aloo tikki chaat'], allergens: ['cereals', 'milk'], confidence: 'medium', note: 'Potato patty, yoghurt topping' },
  { match: ['samosa chaat'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat samosa, yoghurt' },
  { match: ['mixed chaat'], allergens: ['cereals', 'milk'], confidence: 'medium', note: 'Various fried items, yoghurt' },

  // ─── Daal / Veg curries ───
  { match: ['chana masala', 'chana daal', 'kidney beans', 'rajma', 'aloo gobi'], allergens: [], confidence: 'high', note: 'Generally allergen-free (verify mustard oil use)' },
  { match: ['daal', 'tarka', 'tadka'], allergens: [], confidence: 'high', note: 'Lentils, check if mustard seeds/oil used' },
  { match: ['saag'], allergens: ['milk'], confidence: 'medium', note: 'May contain butter/ghee' },

  // ─── Desserts ───
  { match: ['gajar halwa', 'carrot halwa'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Ghee, khoya/milk, almonds/pistachios' },
  { match: ['gulab jamun'], allergens: ['milk', 'cereals', 'nuts'], confidence: 'high', note: 'Khoya, flour, syrup, pistachio garnish' },
  { match: ['rasmalai'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Chenna/paneer in cream, pistachio garnish' },
  { match: ['kheer', 'sheer khurma', 'shahi kheer'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Rice pudding with milk, almonds, pistachios' },
  { match: ['kulfi'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Frozen milk dessert with pistachios/almonds' },
  { match: ['sooji halwa'], allergens: ['cereals', 'milk', 'nuts'], confidence: 'high', note: 'Semolina, ghee, almonds' },
  { match: ['rabri'], allergens: ['milk', 'nuts'], confidence: 'high', note: 'Thickened sweetened milk, nuts' },
  { match: ['fruit chaat', 'fruit custard'], allergens: ['milk'], confidence: 'medium', note: 'Check if cream/custard powder used' },

  // ─── Drinks ───
  { match: ['soft drink', 'mint margarita'], allergens: [], confidence: 'high', note: 'Generally allergen-free' },
  { match: ['piña colada'], allergens: ['milk'], confidence: 'medium', note: 'May contain cream/coconut cream' },

  // ─── Sauces ───
  { match: ['mint sauce'], allergens: [], confidence: 'high', note: 'Mint, coriander, generally allergen-free' },
  { match: ['mango chutney', 'apricot chutney'], allergens: ['sulphites'], confidence: 'medium', note: 'Preserved fruit may contain sulphites' },
  { match: ['papadum'], allergens: [], confidence: 'high', note: 'Lentil flour, generally allergen-free' },

  // ─── Salads ───
  { match: ['garden salad'], allergens: [], confidence: 'high', note: 'Fresh vegetables' },
  { match: ['russian salad'], allergens: ['eggs', 'milk', 'mustard'], confidence: 'high', note: 'Mayonnaise (eggs, mustard), cream' },
  { match: ['grilled chicken salad'], allergens: ['mustard'], confidence: 'medium', note: 'Dressing may contain mustard' },

  // ─── Platters (composite) ───
  { match: ['platter', 'feast'], allergens: ['cereals', 'milk', 'mustard', 'nuts'], confidence: 'medium', note: 'Composite dish — contains multiple items with various allergens' },

  // ─── Specials ───
  { match: ['halwa puri'], allergens: ['cereals', 'milk', 'nuts'], confidence: 'high', note: 'Semolina halwa (ghee, almonds), wheat puri' },
  { match: ['channa paratha', 'pathora channa'], allergens: ['cereals', 'milk'], confidence: 'high', note: 'Wheat paratha/bhatura, ghee' },
  { match: ['steak', 'ribeye'], allergens: ['milk', 'mustard'], confidence: 'medium', note: 'Butter baste, check seasoning' },
  { match: ['brisket'], allergens: ['cereals', 'mustard', 'sulphites'], confidence: 'medium', note: 'Marinade may contain soy/mustard/sulphites' },
  { match: ['turkey roast'], allergens: ['cereals', 'milk'], confidence: 'medium', note: 'Stuffing, butter baste' },
  { match: ['chargha', 'dum chargha'], allergens: ['cereals', 'milk', 'eggs'], confidence: 'medium', note: 'Fried whole chicken — batter, yoghurt, egg coating' },
  { match: ['shinwari'], allergens: ['mustard'], confidence: 'medium', note: 'Oil-based karahi, check mustard oil' },
];

function matchItem(name, category) {
  const text = (name + ' ' + category).toLowerCase();
  
  for (const rule of RULES) {
    const patterns = Array.isArray(rule.match) ? rule.match : [rule.match];
    for (const pat of patterns) {
      if (text.includes(pat.toLowerCase())) {
        return rule;
      }
    }
  }
  return null;
}

function processMenu(filePath) {
  const menu = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const populated = [];
  const needsKitchen = [];
  
  for (const item of menu) {
    const rule = matchItem(item.name, item.category);
    
    if (rule && rule.allergens.length > 0) {
      item.allergens = [...new Set(rule.allergens)].sort();
      populated.push({ name: item.name, allergens: item.allergens, confidence: rule.confidence, note: rule.note });
    } else if (rule && rule.allergens.length === 0) {
      item.allergens = [];
      populated.push({ name: item.name, allergens: [], confidence: rule.confidence, note: rule.note });
    } else {
      needsKitchen.push({ name: item.name, category: item.category });
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(menu, null, 2) + '\n');
  return { populated, needsKitchen, total: menu.length };
}

// Process both menus
console.log('=== Processing Hayes Menu ===');
const hayes = processMenu(path.join(__dirname, '..', 'src', 'data', 'tov-menu.json'));
console.log(`Total: ${hayes.total} | Auto-populated: ${hayes.populated.length} | Needs kitchen: ${hayes.needsKitchen.length}`);

console.log('\n=== Processing Slough Menu ===');
const slough = processMenu(path.join(__dirname, '..', 'src', 'data', 'tov-menu-slough.json'));
console.log(`Total: ${slough.total} | Auto-populated: ${slough.populated.length} | Needs kitchen: ${slough.needsKitchen.length}`);

// Print items that still need kitchen input
if (hayes.needsKitchen.length > 0) {
  console.log('\n--- Hayes items needing kitchen verification ---');
  hayes.needsKitchen.forEach(i => console.log(`  - ${i.name} (${i.category})`));
}
if (slough.needsKitchen.length > 0) {
  console.log('\n--- Slough items needing kitchen verification ---');
  slough.needsKitchen.forEach(i => console.log(`  - ${i.name} (${i.category})`));
}

// Summary of high-confidence assignments
console.log('\n--- High confidence allergen assignments ---');
[...hayes.populated, ...slough.populated]
  .filter(p => p.confidence === 'high' && p.allergens.length > 0)
  .forEach(p => console.log(`  ✓ ${p.name}: [${p.allergens.join(', ')}] — ${p.note}`));

console.log('\n--- Medium confidence (NEEDS KITCHEN VERIFICATION) ---');
[...hayes.populated, ...slough.populated]
  .filter(p => p.confidence === 'medium')
  .forEach(p => console.log(`  ? ${p.name}: [${p.allergens.join(', ')}] — ${p.note}`));
