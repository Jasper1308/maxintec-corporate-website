'use strict';
const fs = require('fs');
const files = [
  '/home/adrianjasper/projects/maxintec-corporate-website/src/app/(client)/login/page.tsx',
  '/home/adrianjasper/projects/maxintec-corporate-website/src/app/(client)/tools/condominio-registration/page.tsx',
  '/home/adrianjasper/projects/maxintec-corporate-website/src/data/headerContent.ts'
];
const reps = [
  ['/client/signup','/signup'],
  ['/client/tools','/tools'],
  ['href: "/client"','href: "/login"']
];

files.forEach((f) => {
  try {
    let s = fs.readFileSync(f, 'utf8');
    let orig = s;
    reps.forEach(([a,b]) => { s = s.split(a).join(b); });
    if (s !== orig) {
      fs.writeFileSync(f, s, 'utf8');
      console.log('Patched', f);
    } else {
      console.log('No changes for', f);
    }
  } catch (err) {
    console.error('Error processing', f, err.message);
  }
});
