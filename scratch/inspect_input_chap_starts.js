const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

async function inspectInputChapStarts() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx"));
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const bodyNode = doc.getElementsByTagName('w:body')[0];
  const pNodes = Array.from(bodyNode.childNodes).filter(n => n.nodeName === 'w:p');

  pNodes.forEach((p, idx) => {
    const tNodes = p.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    if (/^CHAPTER/i.test(text) || /Chapter/i.test(text)) {
      console.log(`[p${idx + 1}] "${text}"`);
    }
  });
}

inspectInputChapStarts().catch(err => console.error(err));
