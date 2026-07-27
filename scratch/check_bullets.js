const FS = require('fs');
const JSZip = require('jszip');

async function checkBulletPoints() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx"));
  const docXml = await zip.file("word/document.xml").async("string");

  const pRegex = /<w:p(?:\s+[^>]*?)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let bulletParagraphs = [];
  let count = 0;

  while ((match = pRegex.exec(docXml)) !== null) {
    count++;
    const pXml = match[0];
    const tMatches = pXml.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
    const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();

    const hasNumPr = /<w:numPr>/i.test(pXml);
    const hasBulletText = /^[•\-\*▪\u2022\u2013\u2014]\s+/.test(text);
    const hasListStyle = /w:val="List/i.test(pXml);

    if (hasNumPr || hasBulletText || hasListStyle) {
      bulletParagraphs.push({ count, text, hasNumPr, hasBulletText, hasListStyle });
    }
  }

  console.log(`Total paragraphs checked: ${count}`);
  console.log(`Paragraphs with bullet/list properties: ${bulletParagraphs.length}`);
  if (bulletParagraphs.length > 0) {
    console.log("Sample bullet paragraphs:", bulletParagraphs.slice(0, 20));
  }
}

checkBulletPoints().catch(err => console.error(err));
