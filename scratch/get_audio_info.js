const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const audioPath = "C:\\Users\\TOLAN\\Downloads\\WhatsApp Audio 2026-07-21 at 12.08.00 PM.mpeg";

console.log("Ffmpeg binary path:", ffmpegInstaller.path);

ffmpeg.ffprobe(audioPath, (err, metadata) => {
  if (err) {
    console.error("Error probing audio file:", err);
  } else {
    console.log("Audio Metadata:");
    console.log("- Duration (sec):", metadata.format.duration);
    console.log("- Bitrate:", metadata.format.bit_rate);
  }
});
