const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/web/app/(dashboard)/agent/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Likes header (re-do if missing)
if (!content.includes('Likes</th>')) {
  content = content.replace(
    /text-center">Reviews<\/th>\s*<th className="p-6 text-\[10px\] font-black text-gray-400 uppercase tracking-widest text-center">Avg Rating<\/th>/,
    'text-center">Reviews</th>\n                       <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Likes</th>\n                       <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Avg Rating</th>'
  );
}

// 2. Fix broken star/heart in Likes/Favorites column
// Search for the span containing corrupted characters (GPT-OSS replaced it with broken star)
content = content.replace(/<span>[\s\S]*?<\/span>\s*\{p\.favorites\[0\]\?\.count \|\| 0\}/, '<span>❤️</span> {p.favorites?.[0]?.count || 0}');

// 3. Fix broken Mean/Avg Rating dash and add star
content = content.replace(/\{mean !== '.*?' \? 'text-teal-600 bg-teal-50 px-3 py-1 rounded-lg' : 'text-gray-300'\}\}>\{mean\}<\/span>/, 
                          "{mean !== '—' ? 'text-teal-600 bg-teal-50 px-3 py-1 rounded-lg' : 'text-gray-300'}}>{mean} {mean !== '—' && '★'}</span>");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed UI issues in Agent Dashboard.');
