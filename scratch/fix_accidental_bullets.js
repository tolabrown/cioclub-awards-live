const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const INPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx";
const OUTPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean.docx";

async function inspectAndFixBullets() {
  console.log("Cleaning all accidental bullet points...");
  const fileData = FS.readFileSync(INPUT_PATH);
  const zip = await JSZip.loadAsync(fileData);
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  let cleanedCount = 0;

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    if (!text) continue;

    const numPr = pNode.getElementsByTagName('w:numPr')[0];
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';

    const isHeading = styleVal === 'Heading1' || /^Heading/i.test(styleVal);
    const isExplicitBulletText = /^[•\-\*▪\u2022\u2013\u2014]/.test(text);

    // If paragraph has numPr or List style BUT is not an explicit bullet text (like "• ...")
    if ((numPr || /List/i.test(styleVal)) && !isHeading && !isExplicitBulletText) {
      if (numPr) numPr.parentNode.removeChild(numPr);
      if (pStyle) pStyle.setAttribute('w:val', 'Normal');
      cleanedCount++;
    }
  }

  console.log(`Cleaned accidental bullet/list properties from ${cleanedCount} paragraphs!`);

  const serializer = new XMLSerializer();
  const newDocXmlStr = serializer.serializeToString(doc);

  zip.file("word/document.xml", newDocXmlStr);
  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  
  // Try saving back to main file, or clean file if main file is locked by Word
  try {
    FS.writeFileSync(INPUT_PATH, outBuf);
    console.log(`Successfully updated ${INPUT_PATH}`);
  } catch (e) {
    console.log(`Main file locked by Word. Writing to ${OUTPUT_PATH}...`);
    FS.writeFileSync(OUTPUT_PATH, outBuf);
    console.log(`Successfully created ${OUTPUT_PATH}`);
  }
}

inspectAndFixBullets().catch(err => console.error(err));
