const fs = require('fs');
const path = require('path');
async function main(){
  const sharp = require('sharp');
  const inPath = path.join(__dirname,'..','public','favicon.svg');
  const outPath = path.join(__dirname,'..','public','logo-256.png');
  if(!fs.existsSync(inPath)){
    console.error('Input SVG not found:', inPath);
    process.exit(1);
  }
  await sharp(inPath)
    .resize(256,256, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
    .png()
    .toFile(outPath);
  console.log('Wrote', outPath);
}
main().catch(err=>{console.error(err);process.exit(1);});
