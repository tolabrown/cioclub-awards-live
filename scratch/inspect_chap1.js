const FS = require('fs');
const JSZip = require('jszip');

async function inspectOriginalChapter1() {
  const fileData = FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx");
  const zip = await JSZip.loadAsync(fileData);
  const docXml = await zip.file("word/document.xml").async("string");

  const pMatches = docXml.match(/<w:p(?:\s+[^>]*?)?>[\s\S]*?<\/w:p>/g) || [];
  console.log("Paragraphs 25 to 35 in original:");
  for (let i = 25; i < 35; i++) {
    const text = pMatches[i].match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) 
      ? pMatches[i].match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g).map(t => t.replace(/<[^>]+>/g, '')).join('').trim()
      : '';
    console.log(`[p${i+1}] ${text}`);
  }

  console.log("\nParagraphs 120 to 145 in original:");
  for (let i = 120; i < 145; i++) {
    const text = pMatches[i].match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) 
      ? pMatches[i].match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g).map(t => t.replace(/<[^>]+>/g, '')).join('').trim()
      : '';
    console.log(`[p${i+1}] ${text}`);
  }
}

inspectOriginalChapter1().catch(err => console.error(err));
