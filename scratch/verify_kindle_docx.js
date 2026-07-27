const FS = require('fs');
const JSZip = require('jszip');

const FILE_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx";

async function verifyDocx() {
  console.log("Verifying output docx:", FILE_PATH);
  const fileData = FS.readFileSync(FILE_PATH);
  const zip = await JSZip.loadAsync(fileData);
  const docXml = await zip.file("word/document.xml").async("string");

  const pRegex = /<w:p(?:\s+[^>]*?)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let paragraphIndex = 0;
  
  let headingsFound = [];
  let remainingArtifacts = [];
  let pageBreaksCount = 0;

  // Check page breaks
  const pageBreakMatches = docXml.match(/<w:br\s+w:type="page"\/>/g) || [];
  pageBreaksCount = pageBreakMatches.length;

  while ((match = pRegex.exec(docXml)) !== null) {
    const pContent = match[0];
    paragraphIndex++;

    // extract text
    const tMatches = pContent.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
    const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();

    if (!text) continue;

    // Check if Heading1
    if (/<w:pStyle\s+w:val="Heading1"\/>/.test(pContent)) {
      headingsFound.push({ index: paragraphIndex, text });
    }

    // Check for leftover print headers
    if (/Tanitoluwa Adeniba/i.test(text) && !/Copyright|identified as the author|About the Author/i.test(text)) {
      remainingArtifacts.push({ index: paragraphIndex, text });
    }
    if (/THE HO\s?US\s?E\s?W\s?A\s?S\s?NEVER\s?Q\s?UIET/i.test(text) && paragraphIndex > 15) {
      remainingArtifacts.push({ index: paragraphIndex, text });
    }
  }

  console.log("-----------------------------------------");
  console.log(`Verification Results:`);
  console.log(`- Total Headings (` + "`Heading 1`" + `): ${headingsFound.length}`);
  console.log(`- Total Page Breaks: ${pageBreaksCount}`);
  console.log(`- Print Artifacts Remaining: ${remainingArtifacts.length}`);
  console.log("-----------------------------------------");

  console.log("Headings detected in order:");
  headingsFound.forEach((h, i) => {
    console.log(`  ${i + 1}. [Line ${h.index}] ${h.text}`);
  });

  if (remainingArtifacts.length > 0) {
    console.log("\nWARNING: Leftover artifacts found:");
    console.log(remainingArtifacts);
  } else {
    console.log("\nSUCCESS: 0 print header artifacts detected in body text!");
  }
}

verifyDocx().catch(err => console.error(err));
