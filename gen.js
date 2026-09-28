const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="10 10 180 180" fill="none">
  <g stroke="%231A3C34" stroke-width="2" fill="none">
    <path d="M100 10 L190 100 L100 190 L10 100 Z"/>
    <path d="M100 40 L160 100 L100 160 L40 100 Z"/>
    <path d="M100 70 L130 100 L100 130 L70 100 Z"/>
    <path d="M110 10 L110 20 L120 20 L120 30 L130 30 L130 40 L140 40 L140 50"/>
    <path d="M150 50 L150 40 L160 40 L160 30 L170 30 L170 20 L180 20 L180 10"/>
    <path d="M190 110 L180 110 L180 120 L170 120 L170 130 L160 130 L160 140 L150 140"/>
    <path d="M150 150 L160 150 L160 160 L170 160 L170 170 L180 170 L180 180 L190 180"/>
    <path d="M90 190 L90 180 L80 180 L80 170 L70 170 L70 160 L60 160 L60 150"/>
    <path d="M50 150 L50 160 L40 160 L40 170 L30 170 L30 180 L20 180 L20 190"/>
    <path d="M10 90 L20 90 L20 80 L30 80 L30 70 L40 70 L40 60 L50 60"/>
    <path d="M50 50 L40 50 L40 40 L30 40 L30 30 L20 30 L20 20 L10 20"/>
    <circle cx="100" cy="100" r="4" fill="%231A3C34"/>
    <circle cx="100" cy="10" r="3" fill="%231A3C34"/>
    <circle cx="190" cy="100" r="3" fill="%231A3C34"/>
    <circle cx="100" cy="190" r="3" fill="%231A3C34"/>
    <circle cx="10" cy="100" r="3" fill="%231A3C34"/>
    <path d="M25 25 L35 35 M35 25 L25 35"/>
    <path d="M165 25 L175 35 M175 25 L165 35"/>
    <path d="M25 165 L35 175 M35 165 L25 175"/>
    <path d="M165 165 L175 175 M175 165 L165 175"/>
  </g>
</svg>`;

const html = `<html><body style='margin:0; background:#FDFBF7;'><div style='width:100%;height:500px;background-image:url("data:image/svg+xml,${svg}");background-size: 60px 60px;opacity:0.2;'></div></body></html>`;
fs.writeFileSync('test.html', html);
