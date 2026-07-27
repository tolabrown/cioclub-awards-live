const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function findAllBreaks() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V3.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  console.log(`Analyzing ${pNodes.length} paragraphs in V3 docx...`);

  let shortParagraphs = [];
  let orphanedLines = [];

  pNodes.forEach((p, idx) => {
    const tNodes = p.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    const pStyle = p.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';

    const hasBr = p.getElementsByTagName('w:br').length > 0;

    if (hasBr && text) {
      console.log(`[p${idx+1}] Paragraph contains inline <w:br/>: "${text.substring(0, 60)}..."`);
    }

    if (text.length > 0 && text.length < 60 && styleVal === 'Normal') {
      shortParagraphs.push({ line: idx + 1, text });
    }
  });

  console.log("-----------------------------------------");
  console.log(`Short Normal paragraphs (< 60 chars) found: ${shortParagraphs.length}`);
  console.log("Sample short paragraphs:", shortParagraphs.slice(0, 30));
}

findAllBreaks().catch(err => console.error(err));
