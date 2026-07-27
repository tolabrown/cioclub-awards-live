const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function verifyV3() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V3.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  let headings = [];

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    if (!text) continue;

    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';

    if (styleVal === 'Heading1' || /^Heading/i.test(styleVal)) {
      headings.push({ index: i + 1, styleVal, text });
    }
  }

  console.log("=== MASTER V3 KINDLE CREATE CHAPTER DETECTION VERIFICATION ===");
  console.log(`Total Headings Detected: ${headings.length}`);
  headings.forEach((h, idx) => {
    console.log(`  ${idx + 1}. [p${h.index}] (${h.styleVal}) ${h.text}`);
  });
}

verifyV3().catch(err => console.error(err));
