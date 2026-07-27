const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";

const OUTPUT_16X9 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_LyricVideo_16x9.mp4";
const OUTPUT_9X16 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_LyricVideo_9x16.mp4";

const IMAGE_DIR = "C:\\Users\\TOLAN\\.gemini\\antigravity-ide\\brain\\866d890f-c6c6-4d86-a560-844c54e1ff4a";

const IMG1 = Path.join(IMAGE_DIR, "media__1784633648565.jpg"); // Fendi portrait
const IMG2 = Path.join(IMAGE_DIR, "media__1784633648631.jpg"); // Close portrait
const IMG3 = Path.join(IMAGE_DIR, "media__1784633648665.jpg"); // Brightsteps shirt
const IMG4 = Path.join(IMAGE_DIR, "media__1784633648724.jpg"); // African children group photo
const IMG5 = Path.join(IMAGE_DIR, "media__1784632335653.jpg"); // Church bowing handshake
const IMG6 = Path.join(IMAGE_DIR, "media__1784632335669.jpg"); // Church prayer

// Lyric cards timed to the audio
const CARDS = [
  {
    start: "0:00:01.50",
    end: "0:00:14.00",
    title: "Reflection... 🎉🙏🏾❤️",
    lines: [
      "This month has been one of the most emotional",
      "and life-changing months of my life.",
      "Coincidentally, it is also my birth month."
    ]
  },
  {
    start: "0:00:14.80",
    end: "0:00:27.50",
    lines: [
      "As I celebrate another year today,",
      "I can't help but look back and see the hand of God",
      "through every joy, every tear, every victory,",
      "and every trial."
    ]
  },
  {
    start: "0:00:28.30",
    end: "0:00:46.00",
    lines: [
      "This month, I had the privilege of seeing a dream come to life",
      "as Brightsteps Foundation officially held its very first",
      "Education & Community Engagement Event—",
      "a nonprofit initiative born from a passion to ensure African children,",
      "regardless of their background, have access to educational support,",
      "mentorship, and opportunities to thrive."
    ]
  },
  {
    start: "0:00:46.80",
    end: "0:01:06.00",
    lines: [
      "To everyone who believed in this vision, thank you.",
      "I am deeply grateful to United Alliance of African Communities USA,",
      "A New Dimension of Hope Foundation, Colorado Gives Foundation,",
      "Mega Real Estate, King Soopers Green Valley Ranch,",
      "and to Mr. Ebenezer Norman, Mr. Gbenga Adeniyi, Sis Blessing Abraham,",
      "and everyone whose support made this event possible.",
      "You have become part of a story that is already changing lives."
    ]
  },
  {
    start: "0:01:06.80",
    end: "0:01:21.00",
    lines: [
      "If God places it on your heart to support our mission",
      "of empowering African children through education,",
      "we would be honored to partner with you.",
      "",
      "📧 info@brightsteps-foundation.org",
      "📞 +1 (646) 371-3827",
      "🌐 brightsteps-foundation.org"
    ]
  },
  {
    start: "0:01:21.80",
    end: "0:01:38.00",
    lines: [
      "While God allowed me to witness a dream come true,",
      "July also tested my faith in ways I never imagined.",
      "I survived an armed robbery and came close to losing my life,",
      "while also facing uncertainty at work.",
      "There were moments of fear, disappointment,",
      "and questions I couldn't answer."
    ]
  },
  {
    start: "0:01:38.80",
    end: "0:01:53.00",
    lines: [
      "Yet, here I am—still breathing, still standing, and still believing.",
      "What should have broken me only strengthened my faith.",
      "Thank you to everyone who prayed for me,",
      "encouraged me, and stood by me."
    ]
  },
  {
    start: "0:01:53.80",
    end: "0:02:08.00",
    lines: [
      "As I step into this new year, my prayer is simple:",
      "Lord, use me even more to be a light of hope for children,",
      "and let my life always be a testimony of Your goodness.",
      "",
      "Cheers to another 365 days of purpose, impact,",
      "and God's amazing grace. 🎂🎉✨"
    ]
  }
];

function generateAssFile(isLandscape) {
  const assPath = `C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\lyric_cards_${isLandscape ? '16x9' : '9x16'}.ass`;
  
  const resX = isLandscape ? 1920 : 1080;
  const resY = isLandscape ? 1080 : 1920;
  const fontSize = isLandscape ? 44 : 34;
  const titleSize = isLandscape ? 58 : 46;

  const header = `[Script Info]
Title: Lyric Video Cards (Pillow Music Format)
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: ${resX}
PlayResY: ${resY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LyricCard,Arial,${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,3,2,5,60,60,50,1
Style: TitleCard,Arial,${titleSize},&H0000E5FF,&H000000FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,4,3,5,60,60,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = [];
  CARDS.forEach(card => {
    let cardText = card.lines.join('\\N');
    if (card.title) {
      cardText = `{\\rTitleCard}${card.title}\\N\\N{\\rLyricCard}` + cardText;
    }
    // Add smooth fade in (400ms) and fade out (400ms) effect
    const effectText = `{\\fad(400,400)}${cardText}`;
    events.push(`Dialogue: 0,${card.start},${card.end},LyricCard,,0,0,0,,${effectText}`);
  });

  FS.writeFileSync(assPath, header + events.join('\n'), 'utf8');
  return assPath;
}

async function renderVideos() {
  console.log("Generating Pillow Music Style Lyric Videos...");

  const ass16x9 = generateAssFile(true);
  const ass9x16 = generateAssFile(false);

  const durPerImg = 21.5; // Total duration = 6 * 21.5 = 129 seconds (2 min 9 sec)
  const totalDur = 129;

  const escapedAss16x9 = ass16x9.replace(/\\/g, '/').replace('C:', 'C\\:');
  const escapedAss9x16 = ass9x16.replace(/\\/g, '/').replace('C:', 'C\\:');

  // 1. Render 16:9 Landscape YouTube Lyric Video
  console.log("Encoding 16:9 Landscape YouTube Video...");
  const cmd16x9 = `"${FFMPEG_BIN}" -y ` +
    `-loop 1 -t ${durPerImg} -i "${IMG1}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG2}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG3}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG4}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG5}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG6}" ` +
    `-i "${AUDIO_PATH}" ` +
    `-filter_complex "` +
    `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v0]; ` +
    `[1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v1]; ` +
    `[2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v2]; ` +
    `[3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v3]; ` +
    `[4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v4]; ` +
    `[5:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v5]; ` +
    `[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[vcat]; ` +
    `[vcat]drawbox=y=0:color=black@0.55:width=iw:height=ih:t=fill[vbg]; ` +
    `[vbg]subtitles='${escapedAss16x9}'[v]"` +
    ` -map "[v]" -map 6:a -t ${totalDur} -c:v libx264 -preset fast -crf 19 -c:a aac -b:a 192k "${OUTPUT_16X9}"`;

  try {
    execSync(cmd16x9, { stdio: 'inherit' });
    console.log(`16:9 YouTube Lyric Video generated: ${OUTPUT_16X9}`);
  } catch (err) {
    console.error("16:9 FFmpeg Error:", err.message);
  }

  // 2. Render 9:16 Vertical Mobile Lyric Video
  console.log("Encoding 9:16 Vertical Mobile Video...");
  const cmd9x16 = `"${FFMPEG_BIN}" -y ` +
    `-loop 1 -t ${durPerImg} -i "${IMG1}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG2}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG3}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG4}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG5}" ` +
    `-loop 1 -t ${durPerImg} -i "${IMG6}" ` +
    `-i "${AUDIO_PATH}" ` +
    `-filter_complex "` +
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v0]; ` +
    `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v1]; ` +
    `[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v2]; ` +
    `[3:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v3]; ` +
    `[4:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v4]; ` +
    `[5:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v5]; ` +
    `[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[vcat]; ` +
    `[vcat]drawbox=y=0:color=black@0.55:width=iw:height=ih:t=fill[vbg]; ` +
    `[vbg]subtitles='${escapedAss9x16}'[v]"` +
    ` -map "[v]" -map 6:a -t ${totalDur} -c:v libx264 -preset fast -crf 19 -c:a aac -b:a 192k "${OUTPUT_9X16}"`;

  try {
    execSync(cmd9x16, { stdio: 'inherit' });
    console.log(`9:16 Mobile Lyric Video generated: ${OUTPUT_9X16}`);
  } catch (err) {
    console.error("9:16 FFmpeg Error:", err.message);
  }
}

renderVideos().catch(err => console.error(err));
