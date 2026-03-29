const fs = require('fs');
const file = 'app/web/app/(dashboard)/agent/page.tsx';

let content = fs.readFileSync(file, 'utf8');

// Replace corrupted characters
content = content.replace(/â˜…/g, '★');
content = content.replace(/â€”/g, '—');
content = content.replace(/Â·/g, '·');
content = content.replace(/â‚¹/g, '₹');
content = content.replace(/âš ï¸/g, '⚠️');
content = content.replace(/â ¤ï¸/g, '❤️');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed file.');
