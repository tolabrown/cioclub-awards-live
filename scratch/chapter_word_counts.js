const FS = require('fs');
const JSZip = require('jszip');

async function chapterBreakdown() {
  const newZip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx"));
  const newXml = await newZip.file("word/document.xml").async("string");

  const pRegex = /<w:p(?:\s+[^>]*?)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let currentChapter = "Front Matter";
  let counts = {};

  while ((match = pRegex.exec(newXml)) !== null) {
    const pContent = match[0];
    const tMatches = pContent.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
    const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();

    if (!text) continue;

    if (/<w:pStyle\s+w:val="Heading1"\/>/.test(pContent)) {
      currentChapter = text;
      if (!counts[currentChapter]) counts[currentChapter] = 0;
    } else {
      const words = text.split(/\s+/).filter(Boolean).length;
      if (!counts[currentChapter]) counts[currentChapter] = 0;
      counts[currentChapter] += words;
    }
  }

  console.log("=== CHAPTER BY CHAPTER WORD COUNT BREAKDOWN ===");
  let grandTotal = 0;
  for (const [chap, count] of Object.entries(counts)) {
    console.log(`- ${chap.padEnd(65)}: ${count} words`);
    grandTotal += count;
  }
  console.log(`--------------------------------------------------`);
  console.log(`TOTAL BODY WORD COUNT: ${grandTotal} words`);
}

chapterBreakdown().catch(err => console.error(err));
