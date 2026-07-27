const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function findHardBreaks() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  console.log(`Checking ${pNodes.length} paragraphs for broken sentences and hard line breaks...`);

  let brokenSentences = [];
  let hardBrInParagraphs = [];

  for (let i = 0; i < pNodes.length - 1; i++) {
    const p1 = pNodes[i];
    const p2 = pNodes[i + 1];

    // Check for <w:br/> inside paragraph
    const brNodes = p1.getElementsByTagName('w:br');
    if (brNodes.length > 0) {
      const tNodes = p1.getElementsByTagName('w:t');
      let text = '';
      for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
      hardBrInParagraphs.push({ line: i + 1, text: text.trim() });
    }

    // Extract text of p1 and p2
    const t1 = p1.getElementsByTagName('w:t');
    let text1 = '';
    for (let j = 0; j < t1.length; j++) text1 += t1[j].textContent;
    text1 = text1.trim();

    const t2 = p2.getElementsByTagName('w:t');
    let text2 = '';
    for (let j = 0; j < t2.length; j++) text2 += t2[j].textContent;
    text2 = text2.trim();

    if (!text1 || !text2) continue;

    // Check if text1 ends without sentence punctuation (., !, ?, :, ") AND text2 starts with lowercase letter or continuous word
    const endsWithPunct = /[\.\!\?:\x22\u201d\u2019]$/.test(text1);
    const startsWithLower = /^[a-z]/.test(text2);
    const isHyphenatedEnd = /\-$/.test(text1);

    if (isHyphenatedEnd || (!endsWithPunct && startsWithLower && text1.length > 15 && text1.length < 100)) {
      brokenSentences.push({
        line: i + 1,
        part1: text1,
        part2: text2.substring(0, 50) + "..."
      });
    }
  }

  console.log("-----------------------------------------");
  console.log(`Hard <w:br/> line breaks found inside paragraphs: ${hardBrInParagraphs.length}`);
  if (hardBrInParagraphs.length > 0) {
    console.log("Sample hard breaks:", hardBrInParagraphs.slice(0, 10));
  }

  console.log(`Broken sentence splits (hard paragraph returns mid-sentence): ${brokenSentences.length}`);
  if (brokenSentences.length > 0) {
    console.log("Sample broken sentences:", brokenSentences.slice(0, 15));
  }
}

findHardBreaks().catch(err => console.error(err));
