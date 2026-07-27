const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const FOLDER = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Unknown 2026-07-21 at 10.55.44 PM";

const logo1 = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.21.31 PM.jpeg");
const logo2 = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.21.32 PM (1).jpeg");
const logo3 = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.21.32 PM (2).jpeg");
const logo4 = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.21.32 PM.jpeg");
const logo5 = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.20.59 PM.jpeg");

const logoOut16x9 = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\logos_grid_16x9.jpg";
const logoOut9x16 = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\logos_grid_9x16.jpg";

// Create a composite partner logos slide for 16:9
const cmd16 = `"${FFMPEG_BIN}" -y ` +
  `-i "${logo1}" -i "${logo2}" -i "${logo3}" -i "${logo4}" -i "${logo5}" ` +
  `-filter_complex "` +
  `[0:v]scale=320:-1[l1]; [1:v]scale=320:-1[l2]; [2:v]scale=320:-1[l3]; [3:v]scale=320:-1[l4]; [4:v]scale=320:-1[l5]; ` +
  `color=c=white:s=1920x1080[bg]; ` +
  `[bg][l1]overlay=100:450[b1]; ` +
  `[b1][l2]overlay=460:450[b2]; ` +
  `[b2][l3]overlay=820:450[b3]; ` +
  `[b3][l4]overlay=1180:450[b4]; ` +
  `[b4][l5]overlay=1540:450" ` +
  `-vframes 1 "${logoOut16x9}"`;

// Create a composite partner logos slide for 9:16
const cmd9 = `"${FFMPEG_BIN}" -y ` +
  `-i "${logo1}" -i "${logo2}" -i "${logo3}" -i "${logo4}" -i "${logo5}" ` +
  `-filter_complex "` +
  `[0:v]scale=300:-1[l1]; [1:v]scale=300:-1[l2]; [2:v]scale=300:-1[l3]; [3:v]scale=300:-1[l4]; [4:v]scale=300:-1[l5]; ` +
  `color=c=white:s=1080x1920[bg]; ` +
  `[bg][l1]overlay=80:200[b1]; ` +
  `[b1][l2]overlay=420:200[b2]; ` +
  `[b2][l3]overlay=740:200[b3]; ` +
  `[b3][l4]overlay=250:350[b4]; ` +
  `[b4][l5]overlay=580:350" ` +
  `-vframes 1 "${logoOut9x16}"`;

try {
  execSync(cmd16, { stdio: 'inherit' });
  execSync(cmd9, { stdio: 'inherit' });
  console.log("Partner logo grids generated successfully!");
} catch (e) {
  console.error("Error building logo grid:", e.message);
}
