import json
import base64
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pymupdf
import qrcode

def generate_pdf():
    # 1. Load Menu Items
    with open('src/data/tov-menu.json', 'r', encoding='utf-8') as f:
        menu_items = json.load(f)

    # 2. Generate QR Code for Hayes Online Ordering
    qr = qrcode.QRCode(box_size=10, border=1)
    qr.add_data('https://tasteofvillagerestaurants.co.uk/hayes/menu')
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='#1A3C34', back_color='#FDFBF7')
    qr_path = 'public/assets/hayes-menu-qr.png'
    qr_img.save(qr_path)
    with open(qr_path, 'rb') as f:
        qr_b64 = base64.b64encode(f.read()).decode('utf-8')

    # 3. Read Tree Logo SVG
    tree_svg_path = 'public/assets/tov-tree.svg'
    with open(tree_svg_path, 'r', encoding='utf-8') as f:
        tree_svg = f.read()

    # 4. Group items by category
    by_cat = {}
    for item in menu_items:
        cat = item.get('category')
        by_cat.setdefault(cat, []).append(item)

    # Robust dietary badge classification
    def get_dietary_badges(item):
        name = item.get('name', '').lower()
        desc = (item.get('description') or '').lower()
        cat = (item.get('category') or '').lower()
        
        meat_keywords = [
            'chicken', 'lamb', 'meat', 'kebab', 'fish', 'keema', 'qeema', 'chargha', 'paya',
            'nihari', 'haleem', 'wings', 'chops', 'boti', 'seekh', 'murgh', 'gosht',
            'machli', 'anda', 'egg', 'prawn', 'tandoor e khaas', 'murgh nashist', 'mughlai khaas',
            'mixed roll', 'chapli', 'chaplii'
        ]
        is_meat = any(k in name or k in desc for k in meat_keywords)
        
        badges = []
        # Plain breads don't need a veg badge to avoid clutter
        is_bread_cat = cat in ['naan_n_roti', 'lahori_kulchas', 'parathas']
        
        if not is_meat:
            veg_keywords = [
                'paneer', 'daal', 'chana', 'aloo', 'gobi', 'bhindi', 'saag', 'muttar', 
                'rajma', 'pakoda', 'vegetable', 'veggie', 'sev puri', 'gol gappe', 
                'dahi bhalla', 'papri', 'papdi', 'chaat'
            ]
            if is_bread_cat:
                if 'paneer' in name or 'aloo' in name or 'gobi' in name or 'mooli' in name:
                    badges.append('<span class="badge badge-veg">🌱 VEG</span>')
            elif any(k in name for k in veg_keywords) or 'desi_handi' in cat or 'chatkara' in cat:
                if 'vegan' in (item.get('dietary') or []):
                    badges.append('<span class="badge badge-vegan">🌿 VEGAN</span>')
                else:
                    badges.append('<span class="badge badge-veg">🌱 VEG</span>')
        
        spicy_keywords = ['spicy', 'chilli', 'karahi', 'shinwari', 'jalfrezi', 'achari', 'masala', 'charsi', 'desi murgh']
        if any(k in name for k in spicy_keywords):
            badges.append('<span class="badge badge-spicy">🌶️ SPICY</span>')
            
        return ''.join(badges)

    def format_item(item, compact=False):
        name = item.get('name', '')
        price = item.get('price', 0.0)
        desc = item.get('description') or ''
        badges = get_dietary_badges(item)
        price_str = f"£{price:.2f}"
        
        desc_html = f'<div class="item-desc">{desc}</div>' if desc and not compact else ''
        return f'''
        <div class="menu-item {'compact' if compact else ''}">
            <div class="item-header">
                <span class="item-name">{name} {badges}</span>
                <span class="item-dots"></span>
                <span class="item-price">{price_str}</span>
            </div>
            {desc_html}
        </div>
        '''

    def render_section(cat_id, title, subtitle, items, compact=False, cols=1):
        if not items:
            return ''
        items_html = ''.join(format_item(it, compact) for it in items)
        sub_html = f'<div class="section-subtitle">{subtitle}</div>' if subtitle else ''
        return f'''
        <div class="menu-section cols-{cols}">
            <div class="section-header">
                <h3 class="section-title">{title}</h3>
                {sub_html}
            </div>
            <div class="section-items-grid cols-{cols}">
                {items_html}
            </div>
        </div>
        '''

    # Build Masterclass HTML Content
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Taste of Village Hayes - Official Takeaway & Restaurant Menu</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@page {{
    size: A4 portrait;
    margin: 0;
}}

* {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}}

body {{
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #1A3C34;
    background: #E8E5DF;
    line-height: 1.25;
}}

.page {{
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    page-break-after: always;
    break-after: page;
    background-color: #FDFBF7;
    position: relative;
    overflow: hidden;
    padding: 10mm 12mm 9mm 12mm;
    display: flex;
    flex-direction: column;
}}

.page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
}}

/* Top Architectural Motif Frieze */
.frieze-bar {{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6mm;
    background-color: #1A3C34;
    border-bottom: 1.2px solid #C49A45;
    background-image: repeating-linear-gradient(45deg, rgba(196,154,69,0.18) 0, rgba(196,154,69,0.18) 2px, transparent 2px, transparent 8px);
}}

.frieze-bottom {{
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5mm;
    background-color: #1A3C34;
    border-top: 1.2px solid #C49A45;
}}

/* Header Styling */
.header-hero {{
    border: 1.5px solid #1A3C34;
    border-radius: 4px;
    padding: 7px 14px 6px 14px;
    background: #FAF7F2;
    margin-bottom: 7px;
    position: relative;
    box-shadow: 0 1px 3px rgba(26,60,52,0.06);
}}

.header-hero::after {{
    content: '';
    position: absolute;
    inset: 2px;
    border: 0.5px solid #C49A45;
    pointer-events: none;
    border-radius: 2px;
}}

.header-top-row {{
    display: flex;
    align-items: center;
    justify-content: space-between;
}}

.brand-seal {{
    display: flex;
    align-items: center;
    gap: 10px;
}}

.brand-tree-box {{
    width: 44px;
    height: 44px;
    flex-shrink: 0;
}}

.brand-title-wrap h1 {{
    font-family: 'Cinzel', serif;
    font-size: 20pt;
    font-weight: 800;
    color: #1A3C34;
    letter-spacing: 0.14em;
    line-height: 1;
}}

.brand-title-wrap .subtag {{
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 7.2pt;
    font-weight: 800;
    color: #8A3D2A;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-top: 3px;
}}

.header-meta-box {{
    text-align: right;
    font-size: 7.2pt;
    color: #1A3C34;
    line-height: 1.35;
}}

.meta-address {{
    font-weight: 700;
    letter-spacing: 0.05em;
}}

.meta-phone {{
    font-size: 8.5pt;
    font-weight: 800;
    color: #8A3D2A;
    letter-spacing: 0.08em;
}}

.meta-badges {{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 2px;
}}

.meta-badge-pill {{
    background: #1A3C34;
    color: #FDFBF7;
    font-size: 6.2pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 1.5px 5px;
    border-radius: 2px;
    text-transform: uppercase;
}}

.meta-badge-gold {{
    background: #C49A45;
    color: #1A3C34;
}}

.header-banner-strip {{
    margin-top: 4px;
    padding-top: 4px;
    border-top: 0.5px dashed rgba(26,60,52,0.25);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 6.8pt;
    font-weight: 700;
    color: #1A3C34;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}}

/* Running Page Header */
.running-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4px;
    margin-bottom: 7px;
    border-bottom: 1px solid #1A3C34;
    font-size: 7.2pt;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #1A3C34;
}}

.running-header .branch-tag {{
    color: #8A3D2A;
}}

.running-header .page-num {{
    font-family: 'Cinzel', serif;
    font-weight: 700;
    color: #C49A45;
}}

/* Two Column Page Grid */
.page-grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    flex: 1;
    align-content: start;
}}

.col {{
    display: flex;
    flex-direction: column;
    gap: 6.5px;
}}

/* Menu Sections */
.menu-section {{
    background: #FFFFFF;
    border: 0.8px solid #E6E0D4;
    border-radius: 4px;
    padding: 6px 8px 6px 8px;
    position: relative;
}}

.menu-section.hero-accent {{
    background: #FAF7F2;
    border: 1px solid #1A3C34;
}}

.section-header {{
    margin-bottom: 4px;
    padding-bottom: 3px;
    border-bottom: 0.8px solid rgba(138, 61, 42, 0.35);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}}

.section-title {{
    font-family: 'Cinzel', serif;
    font-size: 8.8pt;
    font-weight: 800;
    color: #1A3C34;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}}

.section-subtitle {{
    font-size: 6pt;
    font-weight: 600;
    color: #8A3D2A;
    letter-spacing: 0.05em;
    font-style: italic;
    text-align: right;
}}

/* Section items grid */
.section-items-grid {{
    display: flex;
    flex-direction: column;
    gap: 3.5px;
}}

.section-items-grid.cols-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3.5px 8px;
}}

/* Menu Item */
.menu-item {{
    display: flex;
    flex-direction: column;
}}

.item-header {{
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    width: 100%;
}}

.item-name {{
    font-size: 7.2pt;
    font-weight: 700;
    color: #1A3C34;
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    max-width: 82%;
}}

.item-dots {{
    flex: 1;
    border-bottom: 0.8px dotted rgba(26,60,52,0.3);
    margin: 0 4px;
    min-width: 6px;
    height: 1px;
    align-self: center;
}}

.item-price {{
    font-family: 'Cinzel', serif;
    font-size: 7.6pt;
    font-weight: 800;
    color: #8A3D2A;
    letter-spacing: 0.04em;
    flex-shrink: 0;
}}

.item-desc {{
    font-size: 5.8pt;
    color: #4A5A54;
    line-height: 1.25;
    margin-top: 1px;
    font-weight: 500;
}}

.badge {{
    font-size: 5pt;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 0.5px 2.5px;
    border-radius: 2px;
    display: inline-block;
    vertical-align: middle;
}}

.badge-veg {{
    background: #E8F3EE;
    color: #1A5E3C;
    border: 0.3px solid #85B99F;
}}

.badge-vegan {{
    background: #E8F5E9;
    color: #2E7D32;
    border: 0.3px solid #A5D6A7;
}}

.badge-spicy {{
    background: #FDF0ED;
    color: #C24124;
    border: 0.3px solid #F1A490;
}}

/* Platter Special Box */
.platter-card {{
    background: #FAF5EB;
    border: 1px solid #C49A45;
    border-radius: 4px;
    padding: 5px 8px;
    margin-bottom: 4px;
}}

.platter-card .platter-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}}

.platter-card .platter-name {{
    font-family: 'Cinzel', serif;
    font-size: 8.2pt;
    font-weight: 800;
    color: #8A3D2A;
    letter-spacing: 0.08em;
}}

.platter-card .platter-price {{
    font-family: 'Cinzel', serif;
    font-size: 9pt;
    font-weight: 800;
    color: #1A3C34;
}}

.platter-card .platter-desc {{
    font-size: 6pt;
    color: #33443E;
    line-height: 1.25;
    margin-top: 1.5px;
}}

/* Heritage Callout Card */
.heritage-card {{
    background: #1A3C34;
    color: #FDFBF7;
    border: 1px solid #C49A45;
    border-radius: 4px;
    padding: 7px 10px;
    margin-top: 2px;
}}

.heritage-card h4 {{
    font-family: 'Cinzel', serif;
    font-size: 7.8pt;
    font-weight: 800;
    color: #C49A45;
    letter-spacing: 0.12em;
    margin-bottom: 2px;
}}

.heritage-card p {{
    font-size: 6.2pt;
    line-height: 1.35;
    color: #E2DFD8;
}}

/* Bottom Page Footer */
.page-footer {{
    margin-top: auto;
    padding-top: 5px;
    border-top: 0.8px solid rgba(26,60,52,0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 6.5pt;
    font-weight: 700;
    color: #1A3C34;
    letter-spacing: 0.06em;
}}

.page-footer .footer-center {{
    color: #8A3D2A;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}}

/* Final Page Information Box */
.final-info-box {{
    background: #1A3C34;
    color: #FDFBF7;
    border-radius: 4px;
    padding: 8px 12px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    margin-top: 6px;
    border: 1px solid #C49A45;
}}

.final-info-left h4 {{
    font-family: 'Cinzel', serif;
    font-size: 9.5pt;
    font-weight: 800;
    color: #C49A45;
    letter-spacing: 0.14em;
    margin-bottom: 2px;
}}

.final-info-left p {{
    font-size: 6.5pt;
    line-height: 1.3;
    color: #E2DFD8;
    margin-bottom: 3px;
}}

.final-info-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 3px;
    font-size: 6.5pt;
}}

.final-info-item strong {{
    color: #C49A45;
    display: block;
    font-size: 6.2pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}}

.final-info-qr {{
    text-align: center;
    background: #FAF7F2;
    padding: 5px 7px;
    border-radius: 4px;
    color: #1A3C34;
}}

.final-info-qr img {{
    width: 64px;
    height: 64px;
    display: block;
    margin: 0 auto;
}}

.final-info-qr span {{
    display: block;
    font-size: 5.5pt;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin-top: 2px;
    text-transform: uppercase;
}}
</style>
</head>
<body>

<!-- ════════════════════════════════════════════════════════════════════
     PAGE 1: STARTERS, STREET FOOD, CHARCOAL TANDOOR & ROYAL PLATTERS
     ════════════════════════════════════════════════════════════════════ -->
<div class="page page-1">
    <div class="frieze-bar"></div>

    <!-- Master Header -->
    <div class="header-hero">
        <div class="header-top-row">
            <div class="brand-seal">
                <div class="brand-tree-box">{tree_svg}</div>
                <div class="brand-title-wrap">
                    <h1>TASTE OF VILLAGE</h1>
                    <div class="subtag">HAYES • RESTAURANT & TAKEAWAY • EST. 2012</div>
                </div>
            </div>
            <div class="header-meta-box">
                <div class="meta-address">766B Uxbridge Rd, Hayes, UB4 0RU</div>
                <div class="meta-phone">TEL: 020 3409 3786</div>
                <div class="meta-badges">
                    <span class="meta-badge-pill">🌙 100% Halal</span>
                    <span class="meta-badge-pill meta-badge-gold">⭐ 4.8 Rating</span>
                    <span class="meta-badge-pill">FHRS Rated</span>
                </div>
            </div>
        </div>
        <div class="header-banner-strip">
            <span>🔥 Authentic Punjabi & Mughal Cooking</span>
            <span>• Charcoal Tandoor & Earthen Clay Handis •</span>
            <span>🌐 tasteofvillagerestaurants.co.uk/hayes</span>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="page-grid-2">
        <!-- Col 1 -->
        <div class="col">
            {render_section(
                'talaa_hua_zaiqah', 
                "Tala'a Hua Zaiqah", 
                "Crispy Starters & Savouries", 
                by_cat.get('talaa_hua_zaiqah', [])
            )}

            {render_section(
                'chatkara_junction', 
                "Chatkara Street Food", 
                "Tangy & Savoury Chaats", 
                by_cat.get('chatkara_junction', [])
            )}
        </div>

        <!-- Col 2 -->
        <div class="col">
            {render_section(
                'bbq_tandoor_se', 
                "Charcoal BBQ & Tandoor", 
                "Roasted Over Glowing Coals", 
                by_cat.get('bbq_tandoor_se', [])
            )}

            <!-- BBQ Platters Card -->
            <div class="menu-section hero-accent">
                <div class="section-header">
                    <h3 class="section-title">BBQ Sharing Platters</h3>
                    <div class="section-subtitle">Royal Sizzling Feasts</div>
                </div>
                <div class="section-items-grid">
                    {''.join(f"""
                    <div class="platter-card">
                        <div class="platter-header">
                            <span class="platter-name">{p.get('name')}</span>
                            <span class="platter-price">£{p.get('price'):.2f}</span>
                        </div>
                        <div class="platter-desc">{p.get('description') or 'A magnificent selection of our finest charcoal-grilled meats, tender chops, and seekh kebabs.'}</div>
                    </div>
                    """ for p in by_cat.get('bbq_platter', []))}
                </div>
            </div>
        </div>
    </div>

    <div class="page-footer">
        <span>Taste of Village Hayes • 766B Uxbridge Rd, UB4 0RU</span>
        <span class="footer-center">Live Flame Charcoal Grill & Fresh Breads</span>
        <span>Page 1 of 4</span>
    </div>
    <div class="frieze-bottom"></div>
</div>


<!-- ════════════════════════════════════════════════════════════════════
     PAGE 2: CLAY POT HANDI, KARAHI E KHAAS & VILLAGE CURRIES
     ════════════════════════════════════════════════════════════════════ -->
<div class="page page-2">
    <div class="frieze-bar"></div>

    <div class="running-header">
        <span><span class="branch-tag">Taste of Village Hayes</span> • Traditional Mains & Slow-Cooked Handis</span>
        <span class="page-num">Page 02</span>
    </div>

    <div class="page-grid-2">
        <!-- Col 1 -->
        <div class="col">
            {render_section(
                'desi_handi', 
                "Desi Clay Pot Handi", 
                "Slow-Simmered in Earthenware", 
                by_cat.get('desi_handi', [])
            )}

            {render_section(
                'karahi_e_khaas', 
                "Karahi E Khaas", 
                "Wok-Fried with Fresh Ginger & Chillies", 
                by_cat.get('karahi_e_khaas', [])
            )}

            <div class="heritage-card">
                <h4>THE CLAY POT & KARAHI TRADITION</h4>
                <p>Our Handis are simmered slowly in unglazed earthenware to capture deep, earthy aromas and retain moisture. Our Karahis are wok-fried over ferocious flame in hand-seasoned black iron with fresh ginger juliennes, green chillies, and scorched spices.</p>
            </div>
        </div>

        <!-- Col 2 -->
        <div class="col">
            {render_section(
                'curries_salan_se', 
                "Saalan Se (Village Curries)", 
                "Traditional Rich Gravies & Nihari", 
                by_cat.get('curries_salan_se', [])
            )}
        </div>
    </div>

    <div class="page-footer">
        <span>Order Takeaway & Delivery: 020 3409 3786</span>
        <span class="footer-center">Clay Pot Cooking • Zero Shortcuts</span>
        <span>Page 2 of 4</span>
    </div>
    <div class="frieze-bottom"></div>
</div>


<!-- ════════════════════════════════════════════════════════════════════
     PAGE 3: BIRYANI, ROLLS, BURGERS & TANDOORI BREADS
     ════════════════════════════════════════════════════════════════════ -->
<div class="page page-3">
    <div class="frieze-bar"></div>

    <div class="running-header">
        <span><span class="branch-tag">Taste of Village Hayes</span> • Biryani, Rolls, Burgers & Tandoori Breads</span>
        <span class="page-num">Page 03</span>
    </div>

    <div class="page-grid-2">
        <!-- Col 1 -->
        <div class="col">
            {render_section(
                'biryani_and_rice', 
                "Pulao aur Biryani", 
                "Aromatic Basmati & Dum Biryani", 
                by_cat.get('biryani_and_rice', [])
            )}

            {render_section(
                'rolls', 
                "Flavourful Rolls", 
                "Tandoori Bread Freshly Wrapped", 
                by_cat.get('rolls', [])
            )}

            {render_section(
                'burgers', 
                "Desi Burgers & Street Treats", 
                "Aloo Tikki & Noodle Burgers", 
                by_cat.get('burgers', [])
            )}
        </div>

        <!-- Col 2 -->
        <div class="col">
            {render_section(
                'naan_n_roti', 
                "Tandoori Breads & Naan", 
                "Fresh From The Clay Oven", 
                by_cat.get('naan_n_roti', []),
                compact=True
            )}

            {render_section(
                'lahori_kulchas', 
                "Lahori Kulchas", 
                "Fluffy Hand-Pressed Kulchas", 
                by_cat.get('lahori_kulchas', []),
                compact=True
            )}

            {render_section(
                'parathas', 
                "Stuffed Tandoori Parathas", 
                "Crispy Layered Desi Parathas", 
                by_cat.get('parathas', []),
                compact=True
            )}
        </div>
    </div>

    <div class="page-footer">
        <span>Tandoori Breads Baked Fresh To Order in 400°C Clay Ovens</span>
        <span class="footer-center">Fluffy Naans & Crisp Parathas</span>
        <span>Page 3 of 4</span>
    </div>
    <div class="frieze-bottom"></div>
</div>


<!-- ════════════════════════════════════════════════════════════════════
     PAGE 4: SHARING FEASTS, DESSERTS & GUEST SERVICES
     ════════════════════════════════════════════════════════════════════ -->
<div class="page page-4">
    <div class="frieze-bar"></div>

    <div class="running-header">
        <span><span class="branch-tag">Taste of Village Hayes</span> • Sharing Feasts, Desserts & Guest Information</span>
        <span class="page-num">Page 04</span>
    </div>

    <div class="page-grid-2">
        <!-- Col 1 -->
        <div class="col">
            <!-- Village Signature Platters -->
            <div class="menu-section hero-accent">
                <div class="section-header">
                    <h3 class="section-title">Village Signature Feasts</h3>
                    <div class="section-subtitle">Grand Sharing Platters</div>
                </div>
                <div class="section-items-grid">
                    {''.join(f"""
                    <div class="platter-card">
                        <div class="platter-header">
                            <span class="platter-name">{p.get('name')}</span>
                            <span class="platter-price">£{p.get('price'):.2f}</span>
                        </div>
                        <div class="platter-desc">{p.get('description') or 'A curated celebration of village favorites with kebabs, curries, aromatic rice and tandoori breads.'}</div>
                    </div>
                    """ for p in by_cat.get('village_special_platters', []))}
                </div>
            </div>

            <!-- Weekend Desi Nashta & Brunch -->
            {render_section(
                'weekend_special', 
                "Weekend Desi Nashta", 
                "Halwa Puri & Cholay Bhaturay", 
                by_cat.get('weekend_special', []) + by_cat.get('village_brunch_special', [])
            )}
        </div>

        <!-- Col 2 -->
        <div class="col">
            <!-- Desserts -->
            {render_section(
                'desserts', 
                "Sweet Indulgence (Mithai)", 
                "Traditional Sweets & Kulfis", 
                by_cat.get('desserts', [])
            )}

            <!-- Traditional Drinks & Lassi -->
            <div class="menu-section">
                <div class="section-header">
                    <h3 class="section-title">Traditional Beverages & Lassi</h3>
                    <div class="section-subtitle">Chilled & Refreshing</div>
                </div>
                <div class="section-items-grid">
                    <div class="menu-item compact">
                        <div class="item-header">
                            <span class="item-name">Mango Lassi <span class="badge badge-veg">🌱 VEG</span></span>
                            <span class="item-dots"></span>
                            <span class="item-price">£3.99</span>
                        </div>
                    </div>
                    <div class="menu-item compact">
                        <div class="item-header">
                            <span class="item-name">Sweet / Salted Lassi <span class="badge badge-veg">🌱 VEG</span></span>
                            <span class="item-dots"></span>
                            <span class="item-price">£3.49</span>
                        </div>
                    </div>
                    <div class="menu-item compact">
                        <div class="item-header">
                            <span class="item-name">Desi Karak Chai (Spiced Milk Tea)</span>
                            <span class="item-dots"></span>
                            <span class="item-price">£2.49</span>
                        </div>
                    </div>
                    <div class="menu-item compact">
                        <div class="item-header">
                            <span class="item-name">Soft Drinks & Rubicon Juices</span>
                            <span class="item-dots"></span>
                            <span class="item-price">£1.99</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dietary & Allergens Guide Card -->
            <div class="menu-section" style="background: #FAF7F2; border-color: #C49A45;">
                <div class="section-header">
                    <h3 class="section-title" style="color: #8A3D2A;">Dietary & Allergen Key</h3>
                </div>
                <div style="font-size: 6.2pt; color: #2B3D37; line-height: 1.35;">
                    <p style="margin-bottom: 1.5px;">🌱 <strong>Vegetarian:</strong> Authentic plant and dairy curries prepared separately.</p>
                    <p style="margin-bottom: 1.5px;">🌿 <strong>Vegan:</strong> Pure plant-based preparations with cold-pressed oils.</p>
                    <p style="margin-bottom: 1.5px;">🌶️ <strong>Spicy:</strong> Karahis and curries spiced with authentic green chillies.</p>
                    <p style="margin-bottom: 1.5px;">🌙 <strong>100% Halal:</strong> All poultry, lamb and beef are certified HMC / Halal.</p>
                    <p style="font-size: 5.6pt; color: #6E5A48; margin-top: 2px;"><em>Allergy Notice: Please notify our team of any severe allergies before ordering. Nuts, dairy, gluten, and mustard are handled in our kitchen.</em></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Final Guest Service & Digital Order Bar -->
    <div class="final-info-box">
        <div class="final-info-left">
            <h4>TASTE OF VILLAGE • HAYES BRANCH</h4>
            <p>Experience the authentic taste of Punjab and the Mughal culinary empire. Every dish is seasoned with our family spice blends, prepared over natural wood charcoal, and cooked in seasoned cast-iron karahis.</p>
            <div class="final-info-grid">
                <div class="final-info-item">
                    <strong>LOCATION & PARKING</strong>
                    766B Uxbridge Road, Hayes, UB4 0RU<br>
                    Convenient street & bay parking available
                </div>
                <div class="final-info-item">
                    <strong>HOURS OF SERVICE</strong>
                    Mon – Sun: 12:00 PM – 11:00 PM<br>
                    Weekend Desi Nashta: From 10:00 AM
                </div>
                <div class="final-info-item">
                    <strong>TELEPHONE ORDERS</strong>
                    020 3409 3786 / 07474 888806<br>
                    Collection & Doorstep Delivery Fleet
                </div>
                <div class="final-info-item">
                    <strong>CATERING & CELEBRATIONS</strong>
                    Live Tandoor & Karahi Event Catering<br>
                    Email: sales@faloodaandco.co.uk
                </div>
            </div>
        </div>
        <div class="final-info-qr">
            <img src="data:image/png;base64,{qr_b64}" alt="Order Online QR">
            <span>SCAN TO ORDER ONLINE</span>
            <span style="font-size: 5pt; color: #8A3D2A;">DIRECT MENU & TRACKING</span>
        </div>
    </div>

    <div class="page-footer">
        <span>Sister Branch: 260 Farnham Road, Slough, SL1 4XQ • Tel: 01753 326341</span>
        <span class="footer-center">Taste of Village • Authentic Village Heritage</span>
        <span>Page 4 of 4</span>
    </div>
    <div class="frieze-bottom"></div>
</div>

</body>
</html>'''

    # Save HTML to file
    html_file = 'scripts/tov_hayes_menu.html'
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"HTML template written to {html_file}")

    # Launch Selenium Headless Chrome
    print("Launching headless Chromium...")
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    driver = webdriver.Chrome(options=options)

    # Load file via file:/// URL
    abs_html = os.path.abspath(html_file).replace('\\', '/')
    file_url = f'file:///{abs_html}'
    driver.get(file_url)

    # Execute CDP Page.printToPDF
    print("Printing PDF via CDP Page.printToPDF...")
    result = driver.execute_cdp_cmd('Page.printToPDF', {
        'paperWidth': 8.27, # A4 width in inches
        'paperHeight': 11.69, # A4 height in inches
        'marginTop': 0,
        'marginBottom': 0,
        'marginLeft': 0,
        'marginRight': 0,
        'printBackground': True,
        'preferCSSPageSize': True
    })
    driver.quit()

    pdf_bytes = base64.b64decode(result['data'])

    # Save to public assets
    out_pdf_public = 'public/assets/tov-hayes-menu.pdf'
    with open(out_pdf_public, 'wb') as f:
        f.write(pdf_bytes)
    print(f"Saved public PDF to {out_pdf_public}")

    # Save to brain artifact dir
    artifact_dir = r'C:\Users\user\.gemini\antigravity\brain\6da165d9-d3c1-4a73-b168-f0821470649f'
    out_pdf_artifact = os.path.join(artifact_dir, 'tov-hayes-menu.pdf')
    with open(out_pdf_artifact, 'wb') as f:
        f.write(pdf_bytes)
    print(f"Saved artifact PDF to {out_pdf_artifact}")

    # Render PNG pages with PyMuPDF
    doc = pymupdf.open(stream=pdf_bytes, filetype='pdf')
    print(f"Total pages rendered in PDF: {len(doc)}")
    
    png_paths = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=200) # High-res 200 DPI
        png_name = f'tov-hayes-menu-page-{i+1}.png'
        png_public = os.path.join('public/assets', png_name)
        png_artifact = os.path.join(artifact_dir, png_name)
        pix.save(png_public)
        pix.save(png_artifact)
        png_paths.append(png_artifact)
        print(f"Rendered Page {i+1} to {png_artifact} ({pix.width}x{pix.height})")

    print("PDF generation completed successfully!")
    return len(doc), out_pdf_artifact, png_paths

if __name__ == '__main__':
    generate_pdf()
