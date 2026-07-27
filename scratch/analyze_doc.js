const FS = require('fs');
const JSZip = require('jszip');

async function analyzeContent() {
  const fileData = FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx");
  const zip = await JSZip.loadAsync(fileData);
  const docXml = await zip.file("word/document.xml").async("string");

  // Regex to extract paragraphs with their text and style
  const pRegex = /<w:p(?:\s+[^>]*?)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let count = 0;
  let headingCandidates = [];
  let pageNumberArtifacts = [];
  let runningHeaderArtifacts = [];

  while ((match = pRegex.exec(docXml)) !== null) {
    const pContent = match[1];
    // extract style if any
    const styleMatch = pContent.match(/<w:pStyle\s+w:val="([^"]+)"/);
    const style = styleMatch ? styleMatch[1] : 'Normal';
    
    // extract all text
    const texts = [];
    const tRegex = /<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      texts.push(tMatch[1]);
    }
    const text = texts.join('').trim();

    if (!text) continue;
    count++;

    if (/^(Chapter|PROLOGUE|DEDICATION|CONTENTS|FOREWORD|A NOTE TO THE READER|ACKNOWLEDGEMENTS|RESOURCES|END NOTES|ABOUT THE AUTHOR|THE HOUSE WAS NEVER QUIET)/i.test(text)) {
      headingCandidates.push({ index: count, style, text: text.substring(0, 100) });
    }

    if (/^Tanitoluwa Adeniba/i.test(text) || /^THE HO\s?US\s?E/i.test(text)) {
      runningHeaderArtifacts.push({ index: count, text });
    }

    if (/^\d{1,3}$/.test(text)) {
      pageNumberArtifacts.push({ index: count, text });
    }
  }

  console.log(`Total non-empty paragraphs: ${count}`);
  console.log("Heading candidates found:", headingCandidates.length);
  console.log(headingCandidates.slice(0, 35));
  console.log("Running header artifacts found:", runningHeaderArtifacts.length);
  console.log(runningHeaderArtifacts.slice(0, 10));
  console.log("Standalone page number artifacts found:", pageNumberArtifacts.length);
  console.log(pageNumberArtifacts.slice(0, 15));
}

analyzeContent().catch(err => console.error(err));
