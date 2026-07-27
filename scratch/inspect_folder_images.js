const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const FOLDER = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Unknown 2026-07-21 at 10.55.44 PM";

const files = FS.readdirSync(FOLDER);
console.log(`Found ${files.length} total files.`);

files.forEach(f => {
  const fullPath = Path.join(FOLDER, f);
  if (f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')) {
    try {
      const out = execSync(`"${FFMPEG_BIN}" -i "${fullPath}"`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      const match = e.stderr.match(/Stream #0:0.*Video:.* (\d{2,4})x(\d{2,4})/);
      if (match) {
        console.log(`${f} -> ${match[1]}x${match[2]}`);
      } else {
        console.log(`${f} -> Unknown resolution`);
      }
    }
  }
});
