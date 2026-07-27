const FS = require('fs');
const JSZip = require('jszip');

async function compareWordCounts() {
  const origZip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx"));
  const origXml = await origZip.file("word/document.xml").async("string");

  const newZip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx"));
  const newXml = await newZip.file("word/document.xml").async("string");

  function getPureText(xml) {
    const tMatches = xml.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
    return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
  }

  const origText = getPureText(origXml);
  const newText = getPureText(newXml);

  const origWords = origText.trim().split(/\s+/).filter(Boolean);
  const newWords = newText.trim().split(/\s+/).filter(Boolean);

  console.log("=== WORD COUNT & TEXT CONTENT VERIFICATION ===");
  console.log(`Original total word count: ${origWords.length}`);
  console.log(`New file total word count: ${newWords.length}`);
  console.log(`Word count difference: ${origWords.length - newWords.length} words`);

  // Inspect what words were stripped (should be only running headers & page numbers)
  console.log("\nChecking media/zip differences:");
  console.log("Original zip entries count:", Object.keys(origZip.files).length);
  console.log("New zip entries count:", Object.keys(newZip.files).length);

  // Check image files in zip
  const origImages = Object.keys(origZip.files).filter(f => f.startsWith('word/media/'));
  const newImages = Object.keys(newZip.files).filter(f => f.startsWith('word/media/'));
  console.log(`Original media images: ${origImages.length}`);
  console.log(`New media images: ${newImages.length}`);
  if (origImages.length > 0) {
    let origMediaSize = 0;
    for (const f of origImages) {
      const buf = await origZip.file(f).async("nodebuffer");
      origMediaSize += buf.length;
    }
    console.log(`Total original media bytes: ${origMediaSize}`);
  }
}

compareWordCounts().catch(err => console.error(err));
