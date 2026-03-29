const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/web/app/(dashboard)/agent/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Correct Header order: Reviews -> Likes -> Avg Rating
content = content.replace(
  /Avg Rating<\/th>\s*<th className="p-6 text-\[10px\] font-black text-gray-400 uppercase tracking-widest text-center">Likes<\/th>/,
  'Likes</th>\n                       <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Avg Rating</th>'
);

// 2. Insert Likes TD in the row (after Reviews TD)
content = content.replace(
  /\{reviews\.length\}<\/td>\s*<td className="p-6 text-center font-black">/,
  `{reviews.length}</td>
                            <td className="p-6 text-center">
                               <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-lg font-black">
                                  <span>❤️</span>
                                  {p.favorites?.[0]?.count || 0}
                               </div>
                            </td>
                            <td className="p-6 text-center font-black">`
);

// 3. Add Star to Avg Rating span if missing
content = content.replace(
  /\{mean\}<\/span>/,
  "{mean} {mean !== '—' && '★'}</span>"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed UI v2');
