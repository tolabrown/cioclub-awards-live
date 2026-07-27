const FS = require('fs');
const JSZip = require('jszip');

async function findBodyChapterStarts() {
  const fileData = FS.readFileSync("C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx");
  const zip = await JSZip.loadAsync(fileData);
  const docXml = await zip.file("word/document.xml").async("string");

  const pMatches = docXml.match(/<w:p(?:\s+[^>]*?)?>[\s\S]*?<\/w:p>/g) || [];
  
  pMatches.forEach((p, idx) => {
    const text = p.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) 
      ? p.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g).map(t => t.replace(/<[^>]+>/g, '')).join('').trim()
      : '';

    if (text.includes("PROLOGUE") || text.includes("CHAPTER") || text.includes("Chapter")) {
      console.log(`[p${idx + 1}] ${text}`);
    }
  });
}

findBodyChapterStarts().catch(err => console.error(err));
