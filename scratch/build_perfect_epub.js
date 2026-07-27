const FS = require('fs');
const Path = require('path');
const JSZip = require('jszip');
const { DOMParser } = require('@xmldom/xmldom');

const INPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V3.docx";
const OUTPUT_EPUB = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet.epub";

const BOOK_TITLE = "The House Was Never Quiet: Domestic Violence And What We Hide Behind Closed Doors";
const AUTHOR = "Dr. Tanitoluwa Adeniba";
const PUBLISHER = "Parrésia Publishers Ltd.";
const ISBN = "978-978-62865-0-1";

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildEpub() {
  console.log("Loading docx file for EPUB conversion...");
  const fileData = FS.readFileSync(INPUT_PATH);
  const docxZip = await JSZip.loadAsync(fileData);
  const docXmlStr = await docxZip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");
  const bodyNode = doc.getElementsByTagName('w:body')[0];
  const pNodes = Array.from(bodyNode.childNodes).filter(n => n.nodeName === 'w:p');

  // Extract images from docxZip
  const mediaFiles = {};
  const docxMediaKeys = Object.keys(docxZip.files).filter(k => k.startsWith('word/media/'));
  for (const key of docxMediaKeys) {
    const fileName = Path.basename(key);
    const buf = await docxZip.file(key).async("nodebuffer");
    mediaFiles[fileName] = buf;
  }
  console.log(`Extracted ${Object.keys(mediaFiles).length} images from docx.`);

  // Parse document into structured sections
  let sections = [];
  let currentSection = { title: "Title Page", filename: "title.xhtml", paragraphs: [] };
  sections.push(currentSection);

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const tNodes = pNode.getElementsByTagName('w:t');
    let text = '';
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent;
    text = text.trim();

    const pStyleNode = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyleNode ? pStyleNode.getAttribute('w:val') : '';
    const isHeading1 = styleVal === 'Heading1';

    // Check for drawing/image in paragraph
    const blipNodes = pNode.getElementsByTagName('a:blip');
    let imgName = null;
    if (blipNodes.length > 0) {
      // image embedded
    }

    if (isHeading1 && text) {
      let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (!slug) slug = `section_${sections.length}`;
      let filename = `${slug}.xhtml`;

      currentSection = { title: text, filename, paragraphs: [] };
      sections.push(currentSection);
    } else if (text || imgName) {
      currentSection.paragraphs.push({ text, imgName });
    }
  }

  console.log(`Parsed ${sections.length} HTML sections for EPUB.`);

  // Create EPUB ZIP Archive
  const epubZip = new JSZip();

  // 1. mimetype (Uncompressed, first file in ZIP)
  epubZip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  epubZip.file("META-INF/container.xml", containerXml);

  // 3. EPUB/stylesheet.css
  const stylesheetCss = `
@charset "UTF-8";
body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1em;
  line-height: 1.5;
  color: #111111;
  margin: 5% 8%;
  padding: 0;
}
h1, h2, h3 {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  font-weight: bold;
  color: #1a1a1a;
}
h1 {
  font-size: 1.8em;
  margin-top: 2em;
  margin-bottom: 1em;
  page-break-before: always;
}
h2 {
  font-size: 1.4em;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}
p {
  margin-top: 0;
  margin-bottom: 0.5em;
  text-indent: 1.5em;
  text-align: justify;
}
p.first-p {
  text-indent: 0;
}
p.title-main {
  text-align: center;
  font-size: 2.2em;
  font-weight: bold;
  text-indent: 0;
  margin-top: 3em;
}
p.title-sub {
  text-align: center;
  font-size: 1.2em;
  font-style: italic;
  text-indent: 0;
  margin-bottom: 3em;
}
p.callout-box {
  text-align: center;
  font-weight: bold;
  text-indent: 0;
  background-color: #f2f2f2;
  border-left: 4px solid #333;
  padding: 0.8em 1em;
  margin: 1.5em 0;
}
p.toc-item {
  text-indent: 0;
  text-align: left;
  margin-bottom: 0.8em;
}
p.toc-item a {
  text-decoration: none;
  color: #1a1a1a;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto;
}
`;
  epubZip.file("EPUB/stylesheet.css", stylesheetCss);

  // Add Images to EPUB/images/
  for (const [imgName, imgBuf] of Object.entries(mediaFiles)) {
    epubZip.file(`EPUB/images/${imgName}`, imgBuf);
  }

  // 4. Generate Section XHTML Files
  const manifestItems = [];
  const spineItems = [];
  const tocNavLinks = [];

  manifestItems.push(`<item id="stylesheet" href="stylesheet.css" media-type="text/css"/>`);
  manifestItems.push(`<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>`);
  manifestItems.push(`<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`);

  for (let idx = 0; idx < sections.length; idx++) {
    const sec = sections[idx];
    const itemId = `sec_${idx}`;

    manifestItems.push(`<item id="${itemId}" href="${sec.filename}" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${itemId}"/>`);

    if (idx > 0) {
      tocNavLinks.push(`<li><a href="${sec.filename}">${escapeXml(sec.title)}</a></li>`);
    }

    let xhtmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(sec.title)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
`;

    if (idx === 0) {
      // Title Page
      xhtmlContent += `<p class="title-main">${escapeXml(BOOK_TITLE)}</p>\n`;
      xhtmlContent += `<p class="title-sub">by ${escapeXml(AUTHOR)}</p>\n`;
    } else {
      xhtmlContent += `<h1>${escapeXml(sec.title)}</h1>\n`;
    }

    sec.paragraphs.forEach((p, pIdx) => {
      const text = p.text;
      if (!text) return;

      const pClass = pIdx === 0 ? 'class="first-p"' : '';

      // Check for callout box text
      if (/^(MOTHERING|ABUSE|NAMING|DISCUSSION|WHAT|WHEN|THE|RECOGNIZING)/.test(text) && text.length < 80 && text === text.toUpperCase()) {
        xhtmlContent += `<p class="callout-box">${escapeXml(text)}</p>\n`;
      } else if (sec.title === "Contents") {
        xhtmlContent += `<p class="toc-item">${escapeXml(text)}</p>\n`;
      } else {
        xhtmlContent += `<p ${pClass}>${escapeXml(text)}</p>\n`;
      }
    });

    xhtmlContent += `</body>\n</html>`;
    epubZip.file(`EPUB/${sec.filename}`, xhtmlContent);
  }

  // 5. EPUB/toc.xhtml (EPUB 3 Nav Document)
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${tocNavLinks.join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
  epubZip.file("EPUB/toc.xhtml", navXhtml);

  // 6. EPUB/toc.ncx (NCX for legacy readers)
  const ncxNavPoints = sections.slice(1).map((sec, idx) => `
    <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>${escapeXml(sec.title)}</text></navLabel>
      <content src="${sec.filename}"/>
    </navPoint>`).join('');

  const ncxXml = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:isbn:${ISBN}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(BOOK_TITLE)}</text></docTitle>
  <navMap>
    ${ncxNavPoints}
  </navMap>
</ncx>`;
  epubZip.file("EPUB/toc.ncx", ncxXml);

  // 7. EPUB/package.opf
  const imageManifestItems = Object.keys(mediaFiles).map((img, idx) => {
    const ext = Path.extname(img).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/gif';
    return `<item id="img_${idx}" href="images/${img}" media-type="${mime}"/>`;
  }).join('\n    ');

  const packageOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:isbn:${ISBN}</dc:identifier>
    <dc:title>${escapeXml(BOOK_TITLE)}</dc:title>
    <dc:creator>${escapeXml(AUTHOR)}</dc:creator>
    <dc:publisher>${escapeXml(PUBLISHER)}</dc:publisher>
    <dc:language>en</dc:language>
    <dc:rights>Copyright © 2026 ${escapeXml(AUTHOR)}. All rights reserved.</dc:rights>
    <meta property="dcterms:modified">2026-07-20T20:00:00Z</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
    ${imageManifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
  epubZip.file("EPUB/package.opf", packageOpf);

  // Generate EPUB buffer
  console.log("Compiling final EPUB 3 zip archive...");
  const epubBuf = await epubZip.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
    compression: "DEFLATE"
  });

  FS.writeFileSync(OUTPUT_EPUB, epubBuf);
  console.log(`Successfully generated EPUB 3 file at: ${OUTPUT_EPUB}`);
}

buildEpub().catch(err => console.error(err));
