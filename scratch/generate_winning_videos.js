const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";
const FOLDER = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Unknown 2026-07-21 at 10.55.44 PM";

const OUTPUT_16X9 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_WINNING_16x9.mp4";
const OUTPUT_9X16 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_WINNING_9x16.mp4";

// Selected High-Res Images from Folder
const IMG_INTRO = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM (2).jpeg"); // Brightsteps event close portrait
const IMG_FAITH = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (1).jpeg"); // Faith / community event
const IMG_KIDS = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM.jpeg");     // Brightsteps children learning
const IMG_PARTNERS = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (7).jpeg"); // Event attendees / partners
const IMG_MISSION = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (8).jpeg");  // Smiling child event photo
const IMG_TESTIMONY = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (5).jpeg");// Faith / prayer blessing photo
const IMG_CHURCH = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (3).jpeg");   // Church standing prayer photo
const IMG_FENDI_END = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM (1).jpeg"); // ATTACHED FENDI PORTRAIT AT THE END!

const SLIDES = [
  { img: IMG_INTRO, dur: 15 },
  { img: IMG_FAITH, dur: 15 },
  { img: IMG_KIDS, dur: 20 },
  { img: IMG_PARTNERS, dur: 20 },
  { img: IMG_MISSION, dur: 15 },
  { img: IMG_TESTIMONY, dur: 17 },
  { img: IMG_CHURCH, dur: 14 },
  { img: IMG_FENDI_END, dur: 16 } // Fendi portrait at the end!
];

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
    end: "0:00:29.00",
    lines: [
      "As I celebrate another year today,",
      "I can't help but look back and see the hand of God",
      "through every joy, every tear, every victory,",
      "and every trial."
    ]
  },
  {
    start: "0:00:29.80",
    end: "0:00:49.00",
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
    start: "0:00:49.80",
    end: "0:01:09.00",
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
    start: "0:01:09.80",
    end: "0:01:24.00",
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
    start: "0:01:24.80",
    end: "0:01:41.00",
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
    start: "0:01:41.80",
    end: "0:01:55.00",
    lines: [
      "Yet, here I am—still breathing, still standing, and still believing.",
      "What should have broken me only strengthened my faith.",
      "Thank you to everyone who prayed for me,",
      "encouraged me, and stood by me."
    ]
  },
  {
    start: "0:01:55.80",
    end: "0:02:11.00",
    lines: [
      "As I step into this new year, my prayer is simple:",
      "Lord, use me even more to be a light of hope for children,",
      "and let my life always be a testimony of Your goodness.",
      "",
      "{\\b1\\fs56\\c&H0000FFFF&}Happy Birthday, Olaniyi! 🎂🎉✨{\\b0}"
    ]
  }
];

function generateAssFile(isLandscape) {
  const assPath = `C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\winning_cards_${isLandscape ? '16x9' : '9x16'}.ass`;
  
  const resX = isLandscape ? 1920 : 1080;
  const resY = isLandscape ? 1080 : 1920;
  const fontSize = isLandscape ? 48 : 38;
  const titleSize = isLandscape ? 64 : 52;

  const header = `[Script Info]
Title: Winning Lyric Video Cards
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: ${resX}
PlayResY: ${resY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LyricCard,Arial,${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,3,3,5,60,60,50,1
Style: TitleCard,Arial,${titleSize},&H0000E5FF,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,4,4,5,60,60,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = [];
  CARDS.forEach(card => {
    let cardText = card.lines.join('\\N');
    if (card.title) {
      cardText = `{\\rTitleCard}${card.title}\\N\\N{\\rLyricCard}` + cardText;
    }
    const effectText = `{\\fad(400,400)}${cardText}`;
    events.push(`Dialogue: 0,${card.start},${card.end},LyricCard,,0,0,0,,${effectText}`);
  });

  FS.writeFileSync(assPath, header + events.join('\n'), 'utf8');
  return assPath;
}

async function renderWinningVideos() {
  console.log("Generating WINNING Video Render (No Faces Cut Off, Vibrant Colors, Enhanced Typography)...");

  const ass16x9 = generateAssFile(true);
  const ass9x16 = generateAssFile(false);

  const totalDur = SLIDES.reduce((acc, s) => acc + s.dur, 0); // 132 seconds (2 min 12 sec)

  const escapedAss16x9 = ass16x9.replace(/\\/g, '/').replace('C:', 'C\\:');
  const escapedAss9x16 = ass9x16.replace(/\\/g, '/').replace('C:', 'C\\:');

  // Build FFmpeg inputs string
  let inputArgs = '';
  SLIDES.forEach(s => {
    inputArgs += `-loop 1 -t ${s.dur} -i "${s.img}" `;
  });
  inputArgs += `-i "${AUDIO_PATH}" `;

  // Build filter graph for 16:9 Landscape (NO FACES CUT OFF: Blurred BG + Uncropped Centered FG)
  let filter16x9 = '';
  SLIDES.forEach((s, idx) => {
    filter16x9 += `[${idx}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=25:5[bg${idx}]; `;
    filter16x9 += `[${idx}:v]scale=1920:1080:force_original_aspect_ratio=decrease[fg${idx}]; `;
    filter16x9 += `[bg${idx}][fg${idx}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,setsar=1[v${idx}]; `;
  });
  let concat16x9 = SLIDES.map((_, idx) => `[v${idx}]`).join('');
  concat16x9 += `concat=n=${SLIDES.length}:v=1:a=0[vcat]; `;
  
  // Add frosted glass card box behind text area for maximum readability while keeping surrounding image bright & colorful!
  concat16x9 += `[vcat]drawbox=y=220:color=black@0.42:width=iw:height=640:t=fill[vbg]; `;
  concat16x9 += `[vbg]subtitles='${escapedAss16x9}'[v]`;

  const cmd16x9 = `"${FFMPEG_BIN}" -y ${inputArgs}-filter_complex "${filter16x9}${concat16x9}" -map "[v]" -map ${SLIDES.length}:a -t ${totalDur} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${OUTPUT_16X9}"`;

  console.log("Encoding WINNING 16:9 Landscape Video...");
  try {
    execSync(cmd16x9, { stdio: 'inherit' });
    console.log(`16:9 WINNING Video generated: ${OUTPUT_16X9}`);
  } catch (err) {
    console.error("16:9 FFmpeg Error:", err.message);
  }

  // Build filter graph for 9:16 Vertical Mobile (Full Mobile Fit + Blurred BG for wide photos)
  let filter9x16 = '';
  SLIDES.forEach((s, idx) => {
    filter9x16 += `[${idx}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg${idx}]; `;
    filter9x16 += `[${idx}:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg${idx}]; `;
    filter9x16 += `[bg${idx}][fg${idx}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,setsar=1[v${idx}]; `;
  });
  let concat9x16 = SLIDES.map((_, idx) => `[v${idx}]`).join('');
  concat9x16 += `concat=n=${SLIDES.length}:v=1:a=0[vcat]; `;
  concat9x16 += `[vcat]drawbox=y=540:color=black@0.42:width=iw:height=840:t=fill[vbg]; `;
  concat9x16 += `[vbg]subtitles='${escapedAss9x16}'[v]`;

  const cmd9x16 = `"${FFMPEG_BIN}" -y ${inputArgs}-filter_complex "${filter9x16}${concat9x16}" -map "[v]" -map ${SLIDES.length}:a -t ${totalDur} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${OUTPUT_9X16}"`;

  console.log("Encoding WINNING 9:16 Vertical Mobile Video...");
  try {
    execSync(cmd9x16, { stdio: 'inherit' });
    console.log(`9:16 WINNING Video generated: ${OUTPUT_9X16}`);
  } catch (err) {
    console.error("9:16 FFmpeg Error:", err.message);
  }
}

renderWinningVideos().catch(err => console.error(err));
