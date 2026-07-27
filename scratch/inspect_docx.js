const FS = require('fs');
const JSZip = require('jszip');

async function inspectDocx() {
  const fileData = FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx");
  const zip = await JSZip.loadAsync(fileData);
  
  const docXml = await zip.file("word/document.xml").async("string");
  const stylesXml = zip.file("word/styles.xml") ? await zip.file("word/styles.xml").async("string") : null;
  
  console.log("document.xml size:", docXml.length);
  if (stylesXml) console.log("styles.xml size:", stylesXml.length);

  // Check existing heading styles or paragraph styles
  const styleMatches = docXml.match(/w:val="([^"]+)"/g) || [];
  const uniqueStyles = [...new Set(styleMatches.map(m => m.replace(/w:val="|"/g, '')))];
  console.log("Styles found in document.xml:", uniqueStyles.slice(0, 30));
}

inspectDocx().catch(err => console.error(err));
