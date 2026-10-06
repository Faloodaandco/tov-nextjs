#!/usr/bin/env python3
"""
Sync TOV Slough menu items to Meta Commerce Catalog and create product sets.
Uses the /{catalog_id}/batch endpoint for product creation.
"""

import json
import urllib.request
import urllib.parse
import time

TOKEN = 'EAAPH716pqbsBSvEwrLZAODFhSZCBwIDjCLm5QTTM15ULjrhmtLG3Ajy91l4rD5vsKtoqYzZADKRN4NMZC0gEBKb45WhpWbUzTvD4GQBwzErlPs8n58ZCWHFmYPRMfoEKADcTEEAzyqRx9LgCI7ahvFeHvxTcjVNKz1pWvXI7HsI9JWitn9nQyUS9YWGZBC3gZDZD'
CATALOG_ID = '911031881768895'
GRAPH_URL = 'https://graph.facebook.com/v21.0'

SLOUGH_SETS = {
    'breakfast___desi_nashta': 'TOV Slough - Breakfast & Desi Nashta',
    'sunday_roast': 'TOV Slough - Sunday Roast',
    'starters_n_charcoal_grill': 'TOV Slough - Starters & Charcoal Grill',
    'mains___village_classics': 'TOV Slough - Village Classics',
    'weekend_specials': 'TOV Slough - Weekend Specials',
    'signature_dishes': 'TOV Slough - Signature Dishes',
    'family_platters': 'TOV Slough - Family Platters',
    'salads': 'TOV Slough - Salads',
    'sides_n_sauces': 'TOV Slough - Sides & Sauces',
    'kids_meal': 'TOV Slough - Kids Meal',
    'vegetarian_mains': 'TOV Slough - Vegetarian Mains',
    'naan_n_bread': 'TOV Slough - Naan & Bread',
    'rice_specials': 'TOV Slough - Rice Specials',
    'desserts': 'TOV Slough - Desserts',
    'soft_drinks': 'TOV Slough - Soft Drinks',
    'mocktails_n_lassi': 'TOV Slough - Mocktails & Lassi',
}

DEFAULT_IMAGE = 'https://tasteofvillagerestaurants.co.uk/assets/tov-logo-tree-terracotta-alpha.png'


def create_products_batch(items):
    """Create products using /{catalog_id}/batch endpoint. Max 20 items per request."""
    total_created = 0
    total_errors = 0

    # Process in batches of 20 (Meta limit)
    for i in range(0, len(items), 20):
        batch = items[i:i+20]
        requests_list = []

        for item in batch:
            price_pence = str(int(round(item['price'] * 100)))
            desc = item.get('description', '') or f'{item["name"]} - Taste of Village Slough'
            requests_list.append({
                'method': 'CREATE',
                'retailer_id': item['id'],
                'data': {
                    'name': item['name'],
                    'description': desc[:500],
                    'availability': 'in stock',
                    'currency': 'GBP',
                    'price': price_pence,
                    'category': 'Food, Beverages & Tobacco > Food Items',
                    'image_url': DEFAULT_IMAGE,
                    'url': 'https://tasteofvillagerestaurants.co.uk/slough/menu',
                }
            })

        data = urllib.parse.urlencode({
            'access_token': TOKEN,
            'item_type': 'PRODUCT_ITEM',
            'requests': json.dumps(requests_list),
        }).encode()

        url = f'{GRAPH_URL}/{CATALOG_ID}/batch'
        req = urllib.request.Request(url, data=data, method='POST')

        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                result = json.loads(r.read().decode())
                handles = result.get('handles', [])
                print(f'  ✅ Batch {i//20 + 1}: {len(handles)} handles returned ({len(batch)} items)')
                for item in batch:
                    print(f'     {item["id"]} -> {item["name"]} (£{item["price"]:.2f})')
                total_created += len(batch)
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f'  ❌ Batch {i//20 + 1} error ({e.code}): {body[:200]}')
            total_errors += len(batch)
        except Exception as e:
            print(f'  ❌ Batch {i//20 + 1} error: {str(e)[:100]}')
            total_errors += len(batch)

        time.sleep(2)  # Rate limit safety

    return total_created, total_errors


def create_product_sets(items):
    """Create Slough product sets using retailer_id filter rules."""
    sets_created = 0
    sets_errors = 0

    for cat_id, set_name in SLOUGH_SETS.items():
        cat_items = [i for i in items if i['category'] == cat_id]
        if not cat_items:
            print(f'  ⏭️  {set_name} (no items in category)')
            continue

        retailer_ids = [i['id'] for i in cat_items]

        data = urllib.parse.urlencode({
            'access_token': TOKEN,
            'name': set_name,
            'filter': json.dumps({
                'retailer_id': {'is_any': retailer_ids}
            }),
        }).encode()

        url = f'{GRAPH_URL}/{CATALOG_ID}/product_sets'
        req = urllib.request.Request(url, data=data, method='POST')

        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                result = json.loads(r.read().decode())
                set_id = result.get('id', '?')
                print(f'  ✅ {set_name} ({len(cat_items)} items) -> Set ID: {set_id}')
                sets_created += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f'  ❌ {set_name}: {body[:150]}')
            sets_errors += 1
        except Exception as e:
            print(f'  ❌ {set_name}: {str(e)[:100]}')
            sets_errors += 1

        time.sleep(0.5)

    return sets_created, sets_errors


def main():
    with open('src/data/tov-menu-slough.json', 'r') as f:
        items = json.load(f)

    print(f'📋 TOV Slough Menu: {len(items)} items to sync')
    print(f'📦 Catalog ID: {CATALOG_ID}')
    print(f'🏷️  Product sets: {len(SLOUGH_SETS)}')
    print()

    # Step 1: Create products
    print('═══ Step 1: Creating Products ═══')
    created, errors = create_products_batch(items)
    print(f'\n📊 Products: {created} submitted, {errors} errors')
    print()

    # Step 2: Create product sets
    print('═══ Step 2: Creating Product Sets ═══')
    sets_ok, sets_err = create_product_sets(items)
    print(f'\n📊 Sets: {sets_ok} created, {sets_err} errors')
    print()

    print('═══ DONE ═══')
    if errors + sets_err == 0:
        print('✅ All items synced and sets created!')
    else:
        print(f'⚠️  Completed with {errors + sets_err} errors')


if __name__ == '__main__':
    main()
