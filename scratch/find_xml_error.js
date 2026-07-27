const FS = require('fs');
const JSZip = require('jszip');

async function findXmlError() {
  const zip = await JSZip.loadAsync(FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx"));
  const docXml = await zip.file("word/document.xml").async("string");

  console.log("Validating XML string length:", docXml.length);

  // Check for any unescaped & or bad characters
  const badAmp = docXml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g);
  if (badAmp) {
    console.log("FOUND UNESCAPED AMPERSANDS! Count:", badAmp.length);
  } else {
    console.log("No unescaped ampersands found.");
  }

  // Check XML balance / open-close tags
  const openTags = docXml.match(/<w:[a-zA-Z0-9]+(?:\s+[^>]*?)?(?<!\/)>/g) || [];
  const closeTags = docXml.match(/<\/w:[a-zA-Z0-9]+>/g) || [];
  console.log(`Open tags count: ${openTags.length}, Close tags count: ${closeTags.length}`);
}

findXmlError().catch(err => console.error(err));
