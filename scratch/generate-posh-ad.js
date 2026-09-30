const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseDir = path.resolve(__dirname, '..');
const foodImgPath = path.join(baseDir, 'public', 'assets', 'menu', 'halwa_puri.jpg');
const logoImgPath = path.join(baseDir, 'public', 'assets', 'tov-full-logo-transparent-inverted.png');
const patternSvgPath = path.join(baseDir, 'public', 'assets', 'tov-pattern.svg');
const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\2ebd47fa-ad30-4b67-b16e-96421343a2f6';
const publicMarketingDir = path.join(baseDir, 'public', 'assets', 'marketing');

if (!fs.existsSync(publicMarketingDir)) {
  fs.mkdirSync(publicMarketingDir, { recursive: true });
}

const foodBase64 = `data:image/jpeg;base64,${fs.readFileSync(foodImgPath).toString('base64')}`;
const logoSvgPath = path.join(baseDir, 'public', 'assets', 'tov-logo.svg');
const logoSvgRaw = fs.readFileSync(logoSvgPath, 'utf8');
// Clean and recolour SVG: remove stray scanner point at top-right, tighten viewBox, and color ivory
const logoSvg = logoSvgRaw
  .replace(/fill="#1C2D22"/g, 'fill="#FAF6F0"')
  .replace(/d="M 859\.001[\s\S]*?M 425\.665/, 'd="M 425.665')
  .replace(/viewBox="0 0 870 748"/, 'viewBox="85 105 725 595"');
const patternSvg = fs.existsSync(patternSvgPath)
  ? fs.readFileSync(patternSvgPath, 'utf8')
  : '';

function generatePoshHTML(width, height, isSquare) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Taste of Village — The Weekend Table</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Cinzel:wght@500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      background-color: #07120B;
      color: #FAF6F0;
      font-family: 'Outfit', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${isSquare ? '40px 48px 36px' : '54px 56px 46px'};
    }

    /* Ambient Warmth & Luxury Lighting */
    .bg-ambient {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 50% 0%, rgba(200, 90, 50, 0.22) 0%, transparent 65%),
        radial-gradient(circle at 10% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 90% 85%, rgba(168, 72, 46, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(10, 24, 15, 0.95) 0%, transparent 80%);
      pointer-events: none;
      z-index: 1;
    }

    /* Architectural Gold Hairline Borders */
    .luxury-frame {
      position: absolute;
      inset: 18px;
      border: 1px solid rgba(212, 175, 55, 0.28);
      pointer-events: none;
      z-index: 20;
    }
    .luxury-frame-inner {
      position: absolute;
      inset: 24px;
      border: 1px solid rgba(212, 175, 55, 0.12);
      pointer-events: none;
      z-index: 20;
    }
    .frame-flourish {
      position: absolute;
      width: 10px;
      height: 10px;
      border: 1px solid #D4AF37;
      z-index: 21;
    }
    .flourish-tl { top: 14px; left: 14px; border-right: none; border-bottom: none; }
    .flourish-tr { top: 14px; right: 14px; border-left: none; border-bottom: none; }
    .flourish-bl { bottom: 14px; left: 14px; border-right: none; border-top: none; }
    .flourish-br { bottom: 14px; right: 14px; border-left: none; border-top: none; }

    /* Heritage Pattern Watermark */
    .pattern-watermark {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 280px;
      height: 280px;
      opacity: 0.18;
      pointer-events: none;
      z-index: 1;
      filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
    }
    .pattern-watermark svg {
      width: 100%;
      height: 100%;
    }

    /* ─── Top Brand Header ─── */
    .header {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .brand-logo-wrap {
      width: ${isSquare ? '140px' : '155px'};
      height: auto;
      margin-bottom: ${isSquare ? '8px' : '12px'};
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
    }
    .brand-logo-wrap svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .curation-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 5px 20px;
      border-radius: 999px;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.35);
      backdrop-filter: blur(8px);
    }
    .curation-pill span {
      font-family: 'Cinzel', serif;
      font-size: ${isSquare ? '10px' : '11px'};
      font-weight: 600;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: #E8CA7E;
    }
    .curation-dot {
      color: rgba(212, 175, 55, 0.5);
      font-size: 8px;
    }

    /* ─── Editorial Headline ─── */
    .hero-title-area {
      position: relative;
      z-index: 10;
      text-align: center;
      margin: ${isSquare ? '10px 0 14px' : '16px 0 18px'};
    }
    .headline-script {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: ${isSquare ? '26px' : '32px'};
      font-weight: 400;
      color: #E5C365;
      letter-spacing: 0.04em;
      line-height: 1.1;
      display: block;
      margin-bottom: 2px;
    }
    .headline-main {
      font-family: 'Cinzel', serif;
      font-size: ${isSquare ? '36px' : '44px'};
      font-weight: 700;
      letter-spacing: 0.07em;
      line-height: 1.12;
      color: #FFFDF9;
      text-shadow: 0 4px 24px rgba(0,0,0,0.7);
    }
    .headline-gold {
      background: linear-gradient(135deg, #FFFDF9 0%, #F5DEB3 35%, #D4AF37 70%, #C85A32 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ─── Hero Photography Frame (Editorial Aperture) ─── */
    .visual-stage {
      position: relative;
      z-index: 10;
      width: 100%;
      height: ${isSquare ? '490px' : '650px'};
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 
        0 25px 60px -15px rgba(0,0,0,0.85),
        0 0 0 1px rgba(212, 175, 55, 0.35),
        inset 0 0 40px rgba(0,0,0,0.4);
    }
    .visual-stage img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 48%;
      transform: scale(1.02);
      filter: contrast(1.04) saturate(1.06) brightness(0.98);
    }
    .stage-vignette {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(180deg, rgba(7,18,11,0.2) 0%, transparent 40%, rgba(7,18,11,0.55) 75%, rgba(7,18,11,0.92) 100%),
        radial-gradient(circle at 50% 50%, transparent 50%, rgba(7,18,11,0.4) 100%);
      pointer-events: none;
    }

    /* Posh Floating Luxury Privilege Seal */
    .luxury-seal {
      position: absolute;
      top: 22px;
      right: 24px;
      width: 136px;
      height: 136px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #223D2D 0%, #0F2015 65%, #07120B 100%);
      border: 1.5px solid rgba(212, 175, 55, 0.7);
      box-shadow: 
        0 16px 36px rgba(0,0,0,0.75),
        0 0 0 5px rgba(7, 18, 11, 0.65),
        inset 0 0 20px rgba(212, 175, 55, 0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      z-index: 15;
    }
    .seal-inner-ring {
      position: absolute;
      inset: 7px;
      border-radius: 50%;
      border: 1px dashed rgba(212, 175, 55, 0.5);
      pointer-events: none;
    }
    .seal-tag {
      font-family: 'Cinzel', serif;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #E5C365;
    }
    .seal-number {
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      font-weight: 700;
      line-height: 0.92;
      color: #FAF6F0;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
      margin: 1px 0;
    }
    .seal-courtesy {
      font-family: 'Cinzel', serif;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: #F0D394;
    }

    /* Stage Bottom Dish Nomenclature */
    .stage-caption {
      position: absolute;
      bottom: 22px;
      left: 26px;
      right: 26px;
      z-index: 12;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .dish-lineage {
      max-width: 620px;
    }
    .dish-lineage-label {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #E5C365;
      margin-bottom: 4px;
      display: block;
      font-weight: 600;
    }
    .dish-lineage-items {
      font-family: 'Cormorant Garamond', serif;
      font-size: ${isSquare ? '20px' : '23px'};
      font-weight: 500;
      font-style: italic;
      color: #FFFDF9;
      line-height: 1.25;
      text-shadow: 0 2px 12px rgba(0,0,0,0.85);
    }
    .hours-badge {
      background: rgba(7, 18, 11, 0.88);
      border: 1px solid rgba(212, 175, 55, 0.5);
      border-radius: 999px;
      padding: 8px 20px;
      font-family: 'Outfit', sans-serif;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #F7E4BD;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      white-space: nowrap;
      shrink-0: 0;
    }

    /* ─── Bottom Privilege & Invitation Bar ─── */
    .privilege-bar {
      position: relative;
      z-index: 10;
      background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.08) 100%);
      border: 1px solid rgba(212, 175, 55, 0.36);
      border-radius: 20px;
      padding: ${isSquare ? '14px 22px' : '16px 28px'};
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(12px);
      margin-top: ${isSquare ? '10px' : '16px'};
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }
    .privilege-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .privilege-title {
      font-family: 'Cinzel', serif;
      font-size: 14.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #FAF6F0;
    }
    .privilege-subtitle {
      font-size: 12px;
      color: rgba(250, 246, 240, 0.72);
      letter-spacing: 0.03em;
    }
    .code-capsule {
      display: flex;
      align-items: center;
      gap: 14px;
      background: linear-gradient(135deg, #A24228 0%, #7E2B15 100%);
      border: 1px solid rgba(255, 225, 170, 0.45);
      padding: 9px 24px;
      border-radius: 12px;
      box-shadow: 
        0 6px 20px rgba(162, 66, 40, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.25);
    }
    .code-meta {
      text-align: right;
    }
    .code-pre {
      font-size: 9px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: rgba(255, 240, 220, 0.85);
      font-weight: 600;
    }
    .code-val {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #FFFDF9;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    /* ─── Footer Lineage ─── */
    .footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: ${isSquare ? '10px' : '14px'};
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(250, 246, 240, 0.6);
      border-top: 1px solid rgba(212, 175, 55, 0.14);
    }
    .footer-venues {
      color: #D4AF37;
      font-weight: 500;
    }
    .footer-domain {
      color: #FAF6F0;
      font-weight: 600;
      letter-spacing: 0.2em;
    }
  </style>
</head>
<body>
  <div class="bg-ambient"></div>
  <div class="luxury-frame"></div>
  <div class="luxury-frame-inner"></div>
  <div class="frame-flourish flourish-tl"></div>
  <div class="frame-flourish flourish-tr"></div>
  <div class="frame-flourish flourish-bl"></div>
  <div class="frame-flourish flourish-br"></div>

  ${patternSvg ? `<div class="pattern-watermark">${patternSvg}</div>` : ''}

  <!-- Header: Real Authentic Full Brand Lockup -->
  <div class="header">
    <div class="brand-logo-wrap">
      ${logoSvg}
    </div>
    <div class="curation-pill">
      <span>The Weekend Morning Table</span>
      <span class="curation-dot">◆</span>
      <span>Hayes &amp; Slough</span>
    </div>
  </div>

  <!-- Editorial Headline -->
  <div class="hero-title-area">
    <span class="headline-script">A Royal Lahori Ritual</span>
    <h1 class="headline-main">
      TRADITIONAL NASHTA,<br>
      <span class="headline-gold">HERITAGE PRESERVED.</span>
    </h1>
  </div>

  <!-- Hero Visual Stage -->
  <div class="visual-stage">
    <img src="${foodBase64}" alt="Authentic Lahori Nashta Spread">
    <div class="stage-vignette"></div>

    <!-- Posh Luxury Privilege Seal -->
    <div class="luxury-seal">
      <div class="seal-inner-ring"></div>
      <span class="seal-tag">WEEKEND</span>
      <span class="seal-number">40%</span>
      <span class="seal-courtesy">COURTESY</span>
    </div>

    <!-- Dish Description & Time Limits -->
    <div class="stage-caption">
      <div class="dish-lineage">
        <span class="dish-lineage-label">The Morning Spread</span>
        <p class="dish-lineage-items">Hand-Puffed Halwa Puri · Slow-Simmered Paya &amp; Nihari · Chana Masala · Spiced Karak Chai</p>
      </div>
      <div class="hours-badge">
        Sat &amp; Sun · Till 2:00 PM
      </div>
    </div>
  </div>

  <!-- Bottom Privilege & Invitation Bar -->
  <div class="privilege-bar">
    <div class="privilege-info">
      <div class="privilege-title">Complimentary Privilege for Direct Orders</div>
      <div class="privilege-subtitle">Valid on all breakfast dishes for Collection &amp; Direct Delivery</div>
    </div>
    <div class="code-capsule">
      <div class="code-meta">
        <span class="code-pre">Apply Code</span>
      </div>
      <span class="code-val">BREAKFAST40</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-venues">Hayes: 766B Uxbridge Rd · Slough: 260 Farnham Rd</div>
    <div class="footer-domain">tasteofvillagerestaurants.co.uk</div>
  </div>
</body>
</html>`;
}

async function renderPoshAds() {
  console.log('Launching headless browser with Playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Portrait 1080x1350 (Instagram Feed / Stories / WhatsApp)
  console.log('Rendering Posh Portrait Ad (1080x1350)...');
  const portraitHTML = generatePoshHTML(1080, 1350, false);
  await page.setViewportSize({ width: 1080, height: 1350 });
  await page.setContent(portraitHTML, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const portraitPublicPath = path.join(publicMarketingDir, 'tov-weekend-breakfast-ad-portrait.png');
  const portraitArtifactPath = path.join(artifactDir, 'tov-weekend-breakfast-ad-portrait.png');
  await page.screenshot({ path: portraitPublicPath, type: 'png' });
  fs.copyFileSync(portraitPublicPath, portraitArtifactPath);
  console.log(`Saved posh portrait ad to ${portraitPublicPath}`);

  // 2. Square 1080x1080 (Google Business Profile / Square Feed / Facebook)
  console.log('Rendering Posh Square Ad (1080x1080)...');
  const squareHTML = generatePoshHTML(1080, 1080, true);
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(squareHTML, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const squarePublicPath = path.join(publicMarketingDir, 'tov-weekend-breakfast-ad-square.png');
  const squareArtifactPath = path.join(artifactDir, 'tov-weekend-breakfast-ad-square.png');
  await page.screenshot({ path: squarePublicPath, type: 'png' });
  fs.copyFileSync(squarePublicPath, squareArtifactPath);
  console.log(`Saved posh square ad to ${squarePublicPath}`);

  await browser.close();
  console.log('All posh marketing ads generated successfully!');
}

renderPoshAds().catch(err => {
  console.error('Failed to render posh ads:', err);
  process.exit(1);
});
