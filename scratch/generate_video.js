const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";
const OUTPUT_VIDEO = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_Mobile.mp4";

const IMAGE_DIR = "C:\\Users\\TOLAN\\.gemini\\antigravity-ide\\brain\\866d890f-c6c6-4d86-a560-844c54e1ff4a";
const IMG1 = Path.join(IMAGE_DIR, "media__1784632335588.jpg");
const IMG2 = Path.join(IMAGE_DIR, "media__1784632335653.jpg");
const IMG3 = Path.join(IMAGE_DIR, "media__1784632335669.jpg");

const TEXT_CONTENT = `JUST A REFLECTION... 🎉🙏🏾❤️

This month has been an emotional and life-changing month. Coincidentally, it is also my birth month.

As I celebrate another year today, I can't help but look back and see the unmistakable hand of God through every joy, every tear, every victory, and every trial. If there is one thing I have learned, it is that God never abandons His own.

This month, I had the privilege of seeing a dream come to life. Brightsteps Foundation officially held its very first Education & Community Engagement Event—a nonprofit initiative born out of a passion to ensure that African children, regardless of their background, have access to educational support, mentorship, and opportunities to thrive.

Watching African children learn, laugh, connect, and smile reminded me why this mission matters. It was a dream that became reality, and I know this is only the beginning.

Thank you to everyone who believed in this vision:
• United Alliance of African Communities USA
• A New Dimension of Hope Foundation
• Colorado Gives Foundation
• Mega Real Estate
• King Soopers Green Valley Ranch
• Mr. Ebenezer Norman, Mr. Gbenga Adeniyi, Sis Blessing Abraham

If God places it on your heart to support our mission, we would be honored to have you partner with us:
📧 Email: info@brightsteps-foundation.org
📞 Phone: +1 (646) 371-3827
🌐 Website: brightsteps-foundation.org

July also tested my faith in ways I never imagined.
I was robbed at gunpoint and came within moments of losing my life. I also faced uncertainty at work and almost lost my job. There were moments of fear, disappointment, and questions I couldn't answer.

Yet, here I am. Still breathing. Still standing. Still believing.
What should have broken me only strengthened my faith. Every challenge became another reminder that my life is preserved for a purpose greater than myself.

Today, I don't just celebrate a birthday—I celebrate God's mercy, His protection, and His unfailing grace.
To those who prayed for me without me knowing, thank you. To those who encouraged me when I felt weak, thank you.

As I step into this new year, my prayer is simple:
Lord, use me even more to shine as a light of hope for children, and let my life remain a testimony of Your goodness.

Cheers to yet another 365 days.
Happy Birthday, Olaniyi! 🎂🎉`;

async function buildVideo() {
  console.log("Preparing Mobile 9:16 Video Generation...");

  const assPath = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\scrolling_text.ass";
  
  const lines = TEXT_CONTENT.split('\n');
  const escapedText = lines.map(l => l.trim()).filter(Boolean).join('\\N');
  
  // ASS Script Header
  const assHeader = `[Script Info]
Title: Birthday Reflection Scrolling Text
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,34,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,2,2,80,80,100,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // ScrollUp;y1;y2;delay -> delay in ms/pixel (speed ~ 4.2ms/px)
  const scrollEvent = `Dialogue: 0,0:00:00.00,0:04:16.42,Default,,0,0,0,ScrollUp;1920;-2800;4.2,${escapedText}`;

  FS.writeFileSync(assPath, assHeader + scrollEvent, 'utf8');
  console.log("Generated ASS subtitle file.");

  // Escape subtitle path for FFmpeg filter on Windows:
  // C:\path -> C\\:/path
  const escapedAssPath = assPath.replace(/\\/g, '/').replace('C:', 'C\\:');

  const cmd = `"${FFMPEG_BIN}" -y ` +
    `-loop 1 -t 85 -i "${IMG1}" ` +
    `-loop 1 -t 85 -i "${IMG2}" ` +
    `-loop 1 -t 86 -i "${IMG3}" ` +
    `-i "${AUDIO_PATH}" ` +
    `-filter_complex "` +
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v0]; ` +
    `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v1]; ` +
    `[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v2]; ` +
    `[v0][v1][v2]concat=n=3:v=1:a=0[vcat]; ` +
    `[vcat]drawbox=y=0:color=black@0.45:width=iw:height=ih:t=fill[vbg]; ` +
    `[vbg]subtitles='${escapedAssPath}'[v]"` +
    ` -map "[v]" -map 3:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${OUTPUT_VIDEO}"`;

  console.log("Executing FFmpeg...");
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Video generated successfully: ${OUTPUT_VIDEO}`);
  } catch (err) {
    console.error("FFmpeg error:", err.message);
  }
}

buildVideo().catch(err => console.error(err));
