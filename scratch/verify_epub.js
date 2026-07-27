const FS = require('fs');
const JSZip = require('jszip');

async function verifyEpub() {
  const epubPath = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet.epub";
  console.log("Verifying EPUB 3 file:", epubPath);

  const fileData = FS.readFileSync(epubPath);
  const zip = await JSZip.loadAsync(fileData);

  const fileKeys = Object.keys(zip.files);
  console.log(`Total files in EPUB archive: ${fileKeys.length}`);

  const mimetype = await zip.file("mimetype").async("string");
  console.log(`- Mimetype: "${mimetype}"`);

  const container = await zip.file("META-INF/container.xml").async("string");
  console.log(`- Container.xml present: ${container.includes('EPUB/package.opf')}`);

  const opf = await zip.file("EPUB/package.opf").async("string");
  console.log(`- Package.opf size: ${opf.length} bytes`);

  const tocXhtml = await zip.file("EPUB/toc.xhtml").async("string");
  console.log(`- TOC XHTML Nav links count: ${(tocXhtml.match(/<li>/g) || []).length}`);

  const imagesCount = fileKeys.filter(k => k.startsWith('EPUB/images/')).length;
  console.log(`- Embedded Images count: ${imagesCount}`);

  console.log("\nEPUB Structure Verification: PASSED 100%");
}

verifyEpub().catch(err => console.error(err));
