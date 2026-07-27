const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function inspectV2TocStart() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V2.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  console.log("=== V2 TOC ITEMS (First 35 Paragraphs) ===");

  for (let i = 0; i < 35; i++) {
    const pNode = pNodes[i];
    if (!pNode) continue;
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';
    console.log(`[p${i+1}] (${styleVal}) "${text}"`);
  }
}

inspectV2TocStart().catch(err => console.error(err));
