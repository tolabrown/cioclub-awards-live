const FS = require('fs');
const JSZip = require('jszip');

async function inspectOriginalBullets() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx"));
  const docXml = await zip.file("word/document.xml").async("string");

  const pRegex = /<w:p(?:\s+[^>]*?)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let count = 0;
  let origBullets = [];

  while ((match = pRegex.exec(docXml)) !== null) {
    count++;
    const pXml = match[0];
    if (/<w:numPr>/i.test(pXml) || /List/i.test(pXml)) {
      const tMatches = pXml.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
      const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
      origBullets.push({ count, text });
    }
  }

  console.log(`Original paragraphs with bullet/list properties: ${origBullets.length}`);
  console.log("Original sample bullets:", origBullets.slice(0, 10));
}

inspectOriginalBullets().catch(err => console.error(err));
