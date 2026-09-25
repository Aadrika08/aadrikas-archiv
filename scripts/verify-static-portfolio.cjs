const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('portfolio-redesign/dist');
for (const file of ['index.html', 'style.css', '404.html', 'writing/index.html', 'research/index.html', 'assets/aadrika-camera.jpeg']) {
  if (!fs.statSync(path.join(root, file)).isFile()) throw new Error('Missing portfolio asset: ' + file);
}
console.log('Static portfolio ready for deployment.');
