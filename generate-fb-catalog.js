const fs = require('fs');

const menuData = JSON.parse(fs.readFileSync('src/data/tov-menu.json', 'utf8'));

// Generate CSV
let csv = 'id,title,description,availability,condition,price,link,image_link,brand,custom_label_0\n';

for (const item of menuData) {
  const id = item.id;
  const title = `"${item.name.replace(/"/g, '""')}"`;
  const desc = `"${(item.description || item.name).replace(/"/g, '""')}"`;
  const price = `${item.price} GBP`;
  const link = `https://tasteofvillagerestaurants.co.uk/menu`;
  let image = item.image || 'https://tasteofvillagerestaurants.co.uk/assets/tov-logo-tree-terracotta-alpha.png';
  if (image.startsWith('/')) image = 'https://tasteofvillagerestaurants.co.uk' + image;
  
  // Format category name (e.g., "desi_handi" -> "Desi Handi")
  let catName = item.category || 'Other';
  catName = catName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const customLabel = `"${catName}"`;
  
  csv += `${id},${title},${desc},in stock,new,${price},${link},${image},Taste of Village,${customLabel}\n`;
}

fs.writeFileSync('tov-catalog-feed.csv', csv);
console.log('Created tov-catalog-feed.csv with Categories (custom_label_0)');
