const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function verifyV2Toc() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V2.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  let inToc = false;

  console.log("=== V2 TABLE OF CONTENTS VERIFICATION ===");
  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;

    if (text === "Contents") {
      inToc = true;
      console.log(`[TOC HEADING] ${text}`);
      continue;
    }

    if (inToc) {
      if (text === "Dedication") {
        // Front matter dedication start after TOC
        if (i > 50) break;
      }
      console.log(`  • ${text}`);
    }
  }
}

verifyV2Toc().catch(err => console.error(err));
