const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function inspectTocBlock() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  console.log("Original TOC area paragraphs (p20 to p65):");

  for (let i = 20; i < 65; i++) {
    const pNode = pNodes[i];
    if (!pNode) continue;
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    console.log(`[p${i+1}] "${text}"`);
  }
}

inspectTocBlock().catch(err => console.error(err));
