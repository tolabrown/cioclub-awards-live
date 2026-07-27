const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";
const OUTPUT_VIDEO = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_Ticker.mp4";

const IMAGE_DIR = "C:\\Users\\TOLAN\\.gemini\\antigravity-ide\\brain\\866d890f-c6c6-4d86-a560-844c54e1ff4a";

// Start Slides (NEW PHOTOS)
const START_IMG1 = Path.join(IMAGE_DIR, "media__1784633648565.jpg");
const START_IMG2 = Path.join(IMAGE_DIR, "media__1784633648631.jpg");
const START_IMG3 = Path.join(IMAGE_DIR, "media__1784633648665.jpg");

// End Slides (EARLIER SHARED PHOTOS)
const END_IMG1 = Path.join(IMAGE_DIR, "media__1784633648724.jpg");
const END_IMG2 = Path.join(IMAGE_DIR, "media__1784632335653.jpg");
const END_IMG3 = Path.join(IMAGE_DIR, "media__1784632335669.jpg");

const RAW_TEXT = `This month has been one of the most emotional and life-changing seasons of my life—and it also happens to be my birth month. As I celebrate another year, I look back with gratitude and see God's faithfulness through every joy, challenge, victory, and lesson. One thing is certain: God never abandons His own. This month, a long-held dream became reality. Brightsteps Foundation successfully hosted its first Education and Community Engagement Event, created to support and empower African children through education, mentorship, and opportunity. Seeing children learn, connect, smile, and grow reminded me why this mission matters. It was a powerful moment and only the beginning of a greater journey. I am deeply grateful to everyone who believed in this vision and helped make it possible. Your support is already making a difference in the lives of many children. At the same time, this month brought unexpected challenges. I experienced moments that tested my faith, my strength, and my resilience. There were times of fear, uncertainty, and difficult questions. Yet through it all, God remained faithful. Today, I am still here—still standing, still believing, and stronger than before. The trials that could have broken me became reminders that my life has purpose. So today, I celebrate more than a birthday. I celebrate God's mercy, protection, grace, and the gift of another year. Thank you to everyone who prayed for me, encouraged me, and stood by me along the way. As I step into this new chapter, my prayer is simple: May my life continue to be a source of hope, encouragement, and impact for others. Here's to another 365 days of faith, purpose, growth, and service. Happy Birthday, Olaniyi! 🎂🎉✨`;

async function buildTickerVideo() {
  console.log("Building Horizontal Right-to-Left Ticker Mobile Video...");

  const textFilePath = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\single_line_ticker.txt";
  // Clean single line text with bullet separators
  const cleanSingleLine = RAW_TEXT.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  FS.writeFileSync(textFilePath, cleanSingleLine, 'utf8');

  // Duration: 110 seconds
  const dur = 18.33;

  // FFmpeg drawtext with right-to-left marquee scroll:
  // x=w-t*(w+text_w)/110:y=1800
  // drawbox at bottom y=1750, height=170, dark background
  const fontFile = "C\\:/Windows/Fonts/arial.ttf";
  const escapedTextFile = textFilePath.replace(/\\/g, '/').replace('C:', 'C\\:');

  const cmd = `"${FFMPEG_BIN}" -y ` +
    `-loop 1 -t ${dur} -i "${START_IMG1}" ` +
    `-loop 1 -t ${dur} -i "${START_IMG2}" ` +
    `-loop 1 -t ${dur} -i "${START_IMG3}" ` +
    `-loop 1 -t ${dur} -i "${END_IMG1}" ` +
    `-loop 1 -t ${dur} -i "${END_IMG2}" ` +
    `-loop 1 -t ${dur} -i "${END_IMG3}" ` +
    `-i "${AUDIO_PATH}" ` +
    `-filter_complex "` +
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v0]; ` +
    `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v1]; ` +
    `[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v2]; ` +
    `[3:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v3]; ` +
    `[4:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v4]; ` +
    `[5:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v5]; ` +
    `[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[vcat]; ` +
    `[vcat]drawbox=y=1740:color=black@0.75:width=1080:height=180:t=fill[vbg]; ` +
    `[vbg]drawtext=fontfile='${fontFile}':textfile='${escapedTextFile}':fontcolor=white:fontsize=38:y=1800:x=w-t*(w+text_w)/110[v]"` +
    ` -map "[v]" -map 6:a -t 110 -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k "${OUTPUT_VIDEO}"`;

  console.log("Executing FFmpeg Ticker Command...");
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Horizontal Ticker Video generated: ${OUTPUT_VIDEO}`);
  } catch (err) {
    console.error("FFmpeg error:", err.message);
  }
}

buildTickerVideo().catch(err => console.error(err));
