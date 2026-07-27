const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";
const OUTPUT_VIDEO = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_Pro_Mobile.mp4";

const IMAGE_DIR = "C:\\Users\\TOLAN\\.gemini\\antigravity-ide\\brain\\866d890f-c6c6-4d86-a560-844c54e1ff4a";

// Start Slides (NEW PHOTOS)
const START_IMG1 = Path.join(IMAGE_DIR, "media__1784633648565.jpg"); // Olaniyi portrait Fendi
const START_IMG2 = Path.join(IMAGE_DIR, "media__1784633648631.jpg"); // Olaniyi close portrait
const START_IMG3 = Path.join(IMAGE_DIR, "media__1784633648665.jpg"); // Olaniyi Brightsteps shirt

// End Slides (EARLIER SHARED PHOTOS - Church & Foundation Kids)
const END_IMG1 = Path.join(IMAGE_DIR, "media__1784633648724.jpg"); // Kids group photo
const END_IMG2 = Path.join(IMAGE_DIR, "media__1784632335653.jpg"); // Church bowing handshake
const END_IMG3 = Path.join(IMAGE_DIR, "media__1784632335669.jpg"); // Church standing prayer

const SCROLL_TEXT = `This month has been one of the most emotional and life-changing seasons of my life—and it also happens to be my birth month.   As I celebrate another year, I look back with gratitude and see God's faithfulness through every joy, challenge, victory, and lesson. One thing is certain: God never abandons His own.   This month, a long-held dream became reality. Brightsteps Foundation successfully hosted its first Education and Community Engagement Event, created to support and empower African children through education, mentorship, and opportunity.   Seeing children learn, connect, smile, and grow reminded me why this mission matters. It was a powerful moment and only the beginning of a greater journey.   I am deeply grateful to everyone who believed in this vision and helped make it possible. Your support is already making a difference in the lives of many children.   At the same time, this month brought unexpected challenges. I experienced moments that tested my faith, my strength, and my resilience. There were times of fear, uncertainty, and difficult questions.   Yet through it all, God remained faithful.   Today, I am still here—still standing, still believing, and stronger than before. The trials that could have broken me became reminders that my life has purpose.   So today, I celebrate more than a birthday. I celebrate God's mercy, protection, grace, and the gift of another year.   Thank you to everyone who prayed for me, encouraged me, and stood by me along the way.   As I step into this new chapter, my prayer is simple: May my life continue to be a source of hope, encouragement, and impact for others.   Here's to another 365 days of faith, purpose, growth, and service.   Happy Birthday, Olaniyi! 🎂🎉✨`;

async function buildProVideo() {
  console.log("Building Professional Mobile 9:16 Video with Ticker News Scroll...");

  // Duration target: 110 seconds (< 2 mins)
  // 6 images total -> ~18.3 sec per image
  const dur = 18.3;

  const assPath = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\bottom_ticker.ass";

  // Clean text single-line horizontal scroll OR multi-line bottom banner scroll
  // To keep full subject/face 100% visible, we put the scrolling text in a sleek dark banner at the BOTTOM (y: 1620 to 1860)
  
  const lines = [
    "JUST A REFLECTION...",
    "",
    "This month has been one of the most emotional and life-changing seasons of my life—and it also happens to be my birth month.",
    "",
    "As I celebrate another year, I look back with gratitude and see God's faithfulness through every joy, challenge, victory, and lesson. One thing is certain: God never abandons His own.",
    "",
    "This month, a long-held dream became reality. Brightsteps Foundation successfully hosted its first Education and Community Engagement Event, created to support and empower African children through education, mentorship, and opportunity.",
    "",
    "Seeing children learn, connect, smile, and grow reminded me why this mission matters. It was a powerful moment and only the beginning of a greater journey.",
    "",
    "I am deeply grateful to everyone who believed in this vision and helped make it possible. Your support is already making a difference in the lives of many children.",
    "",
    "At the same time, this month brought unexpected challenges. I experienced moments that tested my faith, my strength, and my resilience. There were times of fear, uncertainty, and difficult questions.",
    "",
    "Yet through it all, God remained faithful.",
    "",
    "Today, I am still here—still standing, still believing, and stronger than before. The trials that could have broken me became reminders that my life has purpose.",
    "",
    "So today, I celebrate more than a birthday. I celebrate God's mercy, protection, grace, and the gift of another year.",
    "",
    "Thank you to everyone who prayed for me, encouraged me, and stood by me along the way.",
    "",
    "As I step into this new chapter, my prayer is simple: May my life continue to be a source of hope, encouragement, and impact for others.",
    "",
    "Here's to another 365 days of faith, purpose, growth, and service.",
    "",
    "Happy Birthday, Olaniyi! 🎂🎉✨"
  ];

  const formattedAssText = lines.filter(l => l.trim().length > 0).join('\\N\\N');

  const assHeader = `[Script Info]
Title: Bottom Banner Smooth Scroll
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Ticker,Arial,32,&H00FFFFFF,&H000000FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,2,2,2,60,60,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // ScrollUp from bottom (1850) up to top (-3200) inside the bottom dark box (y: 1400 to 1920)
  const scrollEvent = `Dialogue: 0,0:00:00.00,0:01:50.00,Ticker,,0,0,0,ScrollUp;1850;-3500;4.8,${formattedAssText}`;

  FS.writeFileSync(assPath, assHeader + scrollEvent, 'utf8');
  const escapedAssPath = assPath.replace(/\\/g, '/').replace('C:', 'C\\:');

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
    `[vcat]drawbox=y=1380:color=black@0.65:width=iw:height=540:t=fill[vbg]; ` +
    `[vbg]subtitles='${escapedAssPath}'[v]"` +
    ` -map "[v]" -map 6:a -t 110 -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k "${OUTPUT_VIDEO}"`;

  console.log("Executing FFmpeg for Pro Mobile Video...");
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Pro Mobile Video generated successfully: ${OUTPUT_VIDEO}`);
  } catch (err) {
    console.error("FFmpeg error:", err.message);
  }
}

buildProVideo().catch(err => console.error(err));
