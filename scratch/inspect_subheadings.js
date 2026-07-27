const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function findSubheadings() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V2.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  console.log("=== ALL PARAGRAPHS WITH HEADING STYLES OR BOLD SUBHEADINGS ===");

  pNodes.forEach((p, idx) => {
    const tNodes = p.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    if (!text) return;

    const pStyle = p.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';

    if (/Heading/i.test(styleVal) || /^At home:/i.test(text) || /^In faith/i.test(text) || /^MOTHERING/i.test(text) || styleVal === 'Title') {
      console.log(`[p${idx + 1}] (${styleVal}) "${text}"`);
    }
  });
}

findSubheadings().catch(err => console.error(err));
