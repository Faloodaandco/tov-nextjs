const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseDir = path.resolve(__dirname, '..');
const foodImgPath = path.join(baseDir, 'public', 'assets', 'menu', 'halwa_puri.jpg');
const logoImgPath = path.join(baseDir, 'public', 'assets', 'tov-logo-tree-terracotta-alpha.png');
const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\2ebd47fa-ad30-4b67-b16e-96421343a2f6';
const publicMarketingDir = path.join(baseDir, 'public', 'assets', 'marketing');

if (!fs.existsSync(publicMarketingDir)) {
  fs.mkdirSync(publicMarketingDir, { recursive: true });
}

const foodBase64 = `data:image/jpeg;base64,${fs.readFileSync(foodImgPath).toString('base64')}`;
const logoBase64 = fs.existsSync(logoImgPath)
  ? `data:image/png;base64,${fs.readFileSync(logoImgPath).toString('base64')}`
  : '';

function generateHTML(width, height, isSquare) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Taste of Village Ad</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      background-color: #0E1B13;
      background-image: 
        radial-gradient(circle at 50% 25%, rgba(169, 68, 40, 0.28) 0%, transparent 60%),
        radial-gradient(circle at 85% 85%, rgba(212, 175, 55, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 10% 80%, rgba(20, 40, 29, 0.9) 0%, transparent 60%);
      color: #FFFBF7;
      font-family: 'Outfit', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${isSquare ? '48px 56px' : '56px 64px'};
    }

    /* Subtle luxury frame */
    .outer-border {
      position: absolute;
      inset: 20px;
      border: 1px solid rgba(212, 175, 55, 0.35);
      pointer-events: none;
      z-index: 10;
    }
    .corner-decor {
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid #D4AF37;
      z-index: 11;
    }
    .corner-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
    .corner-tr { top: 16px; right: 16px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 16px; left: 16px; border-right: none; border-top: none; }
    .corner-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }

    /* Top Brand Bar */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
    }
    .brand-name {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #FFFBF7;
    }
    .brand-tag {
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #D4AF37;
      font-weight: 700;
      margin-top: 2px;
    }
    .weekend-badge {
      background: rgba(169, 68, 40, 0.3);
      border: 1px solid #A94428;
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #FFB5A0;
      backdrop-filter: blur(8px);
    }

    /* Main Hook / Headline */
    .headline-wrap {
      text-align: center;
      margin: ${isSquare ? '12px 0 16px' : '20px 0 24px'};
      position: relative;
      z-index: 2;
    }
    .headline-sub {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #D4AF37;
      margin-bottom: 8px;
      display: block;
    }
    .headline {
      font-family: 'Cinzel', serif;
      font-size: ${isSquare ? '40px' : '46px'};
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: 0.04em;
      color: #FFFBF7;
      text-shadow: 0 4px 20px rgba(0,0,0,0.6);
      max-width: 900px;
      margin: 0 auto;
    }
    .headline-accent {
      color: #E2725B;
      background: linear-gradient(135deg, #FF9A7B 0%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Center Visual Area */
    .hero-container {
      position: relative;
      width: 100%;
      height: ${isSquare ? '420px' : '530px'};
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }
    .food-card {
      width: 100%;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(212, 175, 55, 0.35);
    }
    .food-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.04);
      filter: contrast(1.05) brightness(1.02);
    }
    .food-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(14,27,19,0.1) 0%, rgba(14,27,19,0.3) 50%, rgba(14,27,19,0.85) 100%);
    }

    /* Overlaid 40% OFF Stamp Badge */
    .discount-stamp {
      position: absolute;
      top: 24px;
      right: 28px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #D4421E, #8C240E);
      border: 3px solid #D4AF37;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,255,255,0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      transform: rotate(6deg);
      z-index: 5;
    }
    .stamp-sub {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #FFE6A3;
    }
    .stamp-pct {
      font-family: 'Cinzel', serif;
      font-size: 46px;
      font-weight: 900;
      line-height: 0.95;
      color: #FFFBF7;
      text-shadow: 0 2px 10px rgba(0,0,0,0.4);
    }
    .stamp-off {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #FFFBF7;
    }

    /* Food Highlights inside Hero */
    .hero-meta {
      position: absolute;
      bottom: 24px;
      left: 28px;
      right: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 4;
    }
    .dishes-pill {
      font-size: 14px;
      font-weight: 700;
      color: #FFFBF7;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      max-width: 580px;
      line-height: 1.4;
    }
    .time-tag {
      background: rgba(14, 27, 19, 0.85);
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #FFE29A;
      backdrop-filter: blur(6px);
      text-transform: uppercase;
    }

    /* Bottom Offer Callout + Promo Code Bar */
    .action-bar {
      margin-top: ${isSquare ? '12px' : '20px'};
      background: rgba(255, 251, 247, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 20px;
      padding: ${isSquare ? '16px 24px' : '18px 28px'};
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 2;
    }
    .action-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .action-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #FFFBF7;
    }
    .action-sub {
      font-size: 12px;
      color: rgba(255, 251, 247, 0.7);
      font-weight: 500;
    }
    .code-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #A94428;
      border: 2px dashed rgba(255, 255, 255, 0.5);
      padding: 10px 22px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(169, 68, 40, 0.4);
    }
    .code-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.8);
    }
    .code-text {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #FFFBF7;
    }

    /* Footer Info */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: rgba(255, 251, 247, 0.65);
      text-transform: uppercase;
      border-top: 1px solid rgba(255, 251, 247, 0.08);
      z-index: 2;
    }
    .footer-loc {
      color: #D4AF37;
    }
    .footer-url {
      color: #FFFBF7;
      letter-spacing: 0.15em;
    }
  </style>
</head>
<body>
  <div class="outer-border"></div>
  <div class="corner-decor corner-tl"></div>
  <div class="corner-decor corner-tr"></div>
  <div class="corner-decor corner-bl"></div>
  <div class="corner-decor corner-br"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand-left">
      ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Taste of Village">` : ''}
      <div>
        <div class="brand-name">Taste of Village</div>
        <div class="brand-tag">Authentic Pakistani Cuisine</div>
      </div>
    </div>
    <div class="weekend-badge">Saturday & Sunday Special</div>
  </div>

  <!-- Headline -->
  <div class="headline-wrap">
    <span class="headline-sub">Traditional Lahori Nashta Spread</span>
    <h1 class="headline">
      YOUR WEEKEND LAHORI NASHTA<br>
      <span class="headline-accent">JUST GOT 40% BETTER.</span>
    </h1>
  </div>

  <!-- Hero Visual -->
  <div class="hero-container">
    <div class="food-card">
      <img src="${foodBase64}" class="food-img" alt="Halwa Puri Platter">
      <div class="food-gradient"></div>

      <!-- Stamp -->
      <div class="discount-stamp">
        <span class="stamp-sub">WEEKEND</span>
        <span class="stamp-pct">40%</span>
        <span class="stamp-off">OFF</span>
      </div>

      <!-- Hero Meta -->
      <div class="hero-meta">
        <div class="dishes-pill">
          ✨ Fresh Halwa Puri · Slow-Cooked Nihari · Siri Paya · Cholay Bhaturay · Karak Chai
        </div>
        <div class="time-tag">
          ⏰ 10:00 AM – 2:00 PM ONLY
        </div>
      </div>
    </div>
  </div>

  <!-- Action Bar / Promo Code -->
  <div class="action-bar">
    <div class="action-details">
      <div class="action-title">Order Online for Collection & Delivery</div>
      <div class="action-sub">Valid on all breakfast items every Saturday & Sunday till 14:00</div>
    </div>
    <div class="code-box">
      <div>
        <div class="code-label">Use Code:</div>
        <div class="code-text">BREAKFAST40</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-loc">📍 Hayes: 766B Uxbridge Rd · Slough: 260 Farnham Rd</div>
    <div class="footer-url">tasteofvillagerestaurants.co.uk</div>
  </div>
</body>
</html>`;
}

async function renderAds() {
  console.log('Launching headless browser with Playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Portrait 1080x1350 (Instagram Feed / Stories / WhatsApp)
  console.log('Rendering Portrait Ad (1080x1350)...');
  const portraitHTML = generateHTML(1080, 1350, false);
  await page.setViewportSize({ width: 1080, height: 1350 });
  await page.setContent(portraitHTML, { waitUntil: 'networkidle' });
  // Wait for Google Fonts to be ready
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const portraitPublicPath = path.join(publicMarketingDir, 'tov-weekend-breakfast-ad-portrait.png');
  const portraitArtifactPath = path.join(artifactDir, 'tov-weekend-breakfast-ad-portrait.png');
  await page.screenshot({ path: portraitPublicPath, type: 'png' });
  fs.copyFileSync(portraitPublicPath, portraitArtifactPath);
  console.log(`Saved portrait ad to ${portraitPublicPath}`);

  // 2. Square 1080x1080 (Google Business Profile / Square Feed / Facebook)
  console.log('Rendering Square Ad (1080x1080)...');
  const squareHTML = generateHTML(1080, 1080, true);
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(squareHTML, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const squarePublicPath = path.join(publicMarketingDir, 'tov-weekend-breakfast-ad-square.png');
  const squareArtifactPath = path.join(artifactDir, 'tov-weekend-breakfast-ad-square.png');
  await page.screenshot({ path: squarePublicPath, type: 'png' });
  fs.copyFileSync(squarePublicPath, squareArtifactPath);
  console.log(`Saved square ad to ${squarePublicPath}`);

  await browser.close();
  console.log('All marketing ads generated successfully!');
}

renderAds().catch(err => {
  console.error('Failed to render ads:', err);
  process.exit(1);
});
