const FS = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

const FFMPEG_BIN = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";
const AUDIO_PATH = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";
const FOLDER = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Unknown 2026-07-21 at 10.55.44 PM";

const OUTPUT_16X9 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_WINNING_16x9.mp4";
const OUTPUT_9X16 = "C:\\Users\\TOLAN\\Downloads\\Olaniyi_Birthday_Reflection_WINNING_9x16.mp4";

// Company logos grid slides generated
const LOGO_GRID_16X9 = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\logos_grid_16x9.jpg";
const LOGO_GRID_9X16 = "C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\logos_grid_9x16.jpg";

// Selected High-Res Images from Folder
const IMG_INTRO = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM (2).jpeg"); // Brightsteps event close portrait
const IMG_FAITH = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (1).jpeg"); // Faith / community event
const IMG_KIDS = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM.jpeg");     // Brightsteps children learning
const IMG_MISSION = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (8).jpeg");  // Smiling child event photo

// THE 3 SPECIFIED ENDING IMAGES IN EXACT USER SEQUENCE:
const IMG_END_CHURCH_PRAY = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (5).jpeg"); // Standing prayer at pulpit
const IMG_END_CHURCH_BOW = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.50 PM (2).jpeg");  // Bowing handshake at pulpit
const IMG_END_BLACK_YELLOW_TOP = Path.join(FOLDER, "WhatsApp Image 2026-07-19 at 9.18.49 PM (1).jpeg"); // Black top with yellow eyes design!

const SLIDES_16X9 = [
  { img: IMG_INTRO, dur: 15 },
  { img: IMG_FAITH, dur: 15 },
  { img: IMG_KIDS, dur: 20 },
  { img: LOGO_GRID_16X9, dur: 20 }, // COMPANY LOGOS GRID SLIDE!
  { img: IMG_MISSION, dur: 15 },
  // ENDING 3 IMAGES ATTACHED BY USER:
  { img: IMG_END_CHURCH_PRAY, dur: 17 },     // Church standing prayer photo
  { img: IMG_END_CHURCH_BOW, dur: 14 },      // Church bowing handshake photo
  { img: IMG_END_BLACK_YELLOW_TOP, dur: 16 } // Black top with yellow design portrait at the very end!
];

const SLIDES_9X16 = [
  { img: IMG_INTRO, dur: 15 },
  { img: IMG_FAITH, dur: 15 },
  { img: IMG_KIDS, dur: 20 },
  { img: LOGO_GRID_9X16, dur: 20 }, // COMPANY LOGOS GRID SLIDE!
  { img: IMG_MISSION, dur: 15 },
  // ENDING 3 IMAGES ATTACHED BY USER:
  { img: IMG_END_CHURCH_PRAY, dur: 17 },     // Church standing prayer photo
  { img: IMG_END_CHURCH_BOW, dur: 14 },      // Church bowing handshake photo
  { img: IMG_END_BLACK_YELLOW_TOP, dur: 16 } // Black top with yellow design portrait at the very end!
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
      "{\\b1\\fs64\\c&H0000FFFF&}Happy Birthday, Olaniyi! 🎂🎉✨{\\b0}"
    ]
  }
];

function generateAssFile(isLandscape) {
  const assPath = `C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\perfect_cards_${isLandscape ? '16x9' : '9x16'}.ass`;
  
  const resX = isLandscape ? 1920 : 1080;
  const resY = isLandscape ? 1080 : 1920;
  const fontSize = isLandscape ? 52 : 42;
  const titleSize = isLandscape ? 68 : 56;
  const marginV = isLandscape ? 40 : 120;

  const header = `[Script Info]
Title: Perfect Lyric Video Cards
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: ${resX}
PlayResY: ${resY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LyricCard,Arial,${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,3,3,2,50,50,${marginV},1
Style: TitleCard,Arial,${titleSize},&H0000E5FF,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,1,4,4,2,50,50,${marginV},1

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

async function prepareAndRender() {
  console.log("Pre-compositing slides with partner company logos and exact ending photos...");

  const prepped16x9 = [];
  const prepped9x16 = [];

  for (let i = 0; i < SLIDES_16X9.length; i++) {
    const s16 = SLIDES_16X9[i];
    const s9 = SLIDES_9X16[i];

    const out16x9 = `C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\final_slide_16x9_${i}.jpg`;
    const out9x16 = `C:\\Users\\TOLAN\\Music\\cioclub_awards\\scratch\\final_slide_9x16_${i}.jpg`;

    // 16:9 composite
    const vf16x9 = `"split[a][b]; [a]scale=160:90:force_original_aspect_ratio=increase,crop=160:90,scale=1920:1080[bg]; [b]scale=1920:1080:force_original_aspect_ratio=decrease[fg]; [bg][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,setsar=1"`;
    execSync(`"${FFMPEG_BIN}" -y -i "${s16.img}" -vf ${vf16x9} "${out16x9}"`, { stdio: 'pipe' });
    prepped16x9.push({ img: out16x9, dur: s16.dur });

    // 9:16 composite
    const vf9x16 = `"split[a][b]; [a]scale=90:160:force_original_aspect_ratio=increase,crop=90:160,scale=1080:1920[bg]; [b]scale=1080:1920:force_original_aspect_ratio=decrease[fg]; [bg][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,setsar=1"`;
    execSync(`"${FFMPEG_BIN}" -y -i "${s9.img}" -vf ${vf9x16} "${out9x16}"`, { stdio: 'pipe' });
    prepped9x16.push({ img: out9x16, dur: s9.dur });
  }

  console.log("Pre-compositing finished! Rendering final WINNING videos...");

  const ass16x9 = generateAssFile(true);
  const ass9x16 = generateAssFile(false);
  const totalDur = SLIDES_16X9.reduce((acc, s) => acc + s.dur, 0); // 132s

  const escapedAss16x9 = ass16x9.replace(/\\/g, '/').replace('C:', 'C\\:');
  const escapedAss9x16 = ass9x16.replace(/\\/g, '/').replace('C:', 'C\\:');

  // Render 16:9
  let input16 = '';
  prepped16x9.forEach(p => { input16 += `-loop 1 -t ${p.dur} -i "${p.img}" `; });
  input16 += `-i "${AUDIO_PATH}" `;

  let concat16 = prepped16x9.map((_, idx) => `[${idx}:v]`).join('');
  concat16 += `concat=n=${prepped16x9.length}:v=1:a=0[vcat]; `;
  concat16 += `[vcat]drawbox=y=620:color=black@0.35:width=iw:height=440:t=fill[vbg]; `;
  concat16 += `[vbg]subtitles='${escapedAss16x9}'[v]`;

  const cmd16x9 = `"${FFMPEG_BIN}" -y ${input16}-filter_complex "${concat16}" -map "[v]" -map ${prepped16x9.length}:a -t ${totalDur} -c:v libx264 -preset fast -crf 19 -c:a aac -b:a 192k "${OUTPUT_16X9}"`;
  
  console.log("Encoding 16:9 WINNING Video with Logos & Exact Ending...");
  execSync(cmd16x9, { stdio: 'inherit' });
  console.log(`16:9 WINNING Video completed: ${OUTPUT_16X9}`);

  // Render 9:16
  let input9 = '';
  prepped9x16.forEach(p => { input9 += `-loop 1 -t ${p.dur} -i "${p.img}" `; });
  input9 += `-i "${AUDIO_PATH}" `;

  let concat9 = prepped9x16.map((_, idx) => `[${idx}:v]`).join('');
  concat9 += `concat=n=${prepped9x16.length}:v=1:a=0[vcat]; `;
  concat9 += `[vcat]drawbox=y=1120:color=black@0.35:width=iw:height=680:t=fill[vbg]; `;
  concat9 += `[vbg]subtitles='${escapedAss9x16}'[v]`;

  const cmd9x16 = `"${FFMPEG_BIN}" -y ${input9}-filter_complex "${concat9}" -map "[v]" -map ${prepped9x16.length}:a -t ${totalDur} -c:v libx264 -preset fast -crf 19 -c:a aac -b:a 192k "${OUTPUT_9X16}"`;
  
  console.log("Encoding 9:16 WINNING Video with Logos & Exact Ending...");
  execSync(cmd9x16, { stdio: 'inherit' });
  console.log(`9:16 WINNING Video completed: ${OUTPUT_9X16}`);
}

prepareAndRender().catch(err => console.error(err));
