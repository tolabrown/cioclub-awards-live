const FS = require('fs');
const JSZip = require('jszip');

const INPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx";
const OUTPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready.docx";

const CHAPTER_DETAILS = [
  { number: 1, title: "Chapter 1: The Violence We Don’t Name" },
  { number: 2, title: "Chapter 2: The House That Lives Inside Us" },
  { number: 3, title: "Chapter 3: Mothers in the Middle" },
  { number: 4, title: "Chapter 4: The Violence That Doesn’t Leave Marks" },
  { number: 5, title: "Chapter 5: The Burden of Endurance" },
  { number: 6, title: "Chapter 6: What the Children See (And What We Think They Don’t)" },
  { number: 7, title: "Chapter 7: Money, Power, and the Quiet Economy of Control" },
  { number: 8, title: "Chapter 8: The Other Side of Father Involvement" },
  { number: 9, title: "Chapter 9: Sisters in the Shadow — Solidarity, Sharing, and Quiet Resistance" },
  { number: 10, title: "Chapter 10: Family and the Weight of Expectations" },
  { number: 11, title: "Chapter 11: When Faith Demands Silence" },
  { number: 12, title: "Chapter 12: Embracing and Questioning Tradition: A Personal Reflection" },
  { number: 13, title: "Chapter 13: Beyond Survival—Reimagining Safety, Family, and Flourishing" }
];

function extractParagraphText(pXml) {
  const tMatches = pXml.match(/<w:t(?:\s+[^>]*?)?>([\s\S]*?)<\/w:t>/g) || [];
  return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
}

function createHeading1Xml(text) {
  const cleanText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<w:p>
    <w:pPr>
      <w:pStyle w:val="Heading1"/>
      <w:keepNext/>
      <w:spacing w:before="480" w:after="240"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:b/>
        <w:bCs/>
        <w:sz w:val="36"/>
        <w:szCs w:val="36"/>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      </w:rPr>
      <w:t>${cleanText}</w:t>
    </w:r>
  </w:p>`;
}

function createPageBreakXml() {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

function createTocItemXml(text) {
  const cleanText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<w:p>
    <w:pPr>
      <w:pStyle w:val="TOC1"/>
      <w:spacing w:before="60" w:after="60"/>
    </w:pPr>
    <w:r>
      <w:t>${cleanText}</w:t>
    </w:r>
  </w:p>`;
}

function formatBodyParagraphXml(pXml, isFirstInChapter) {
  const indentVal = isFirstInChapter ? "0" : "360";
  const indXml = `<w:ind w:firstLine="${indentVal}"/>`;

  let formattedP = pXml;
  if (/<w:pPr>/.test(formattedP)) {
    if (/<w:ind\s+[^>]*?\/>/.test(formattedP)) {
      formattedP = formattedP.replace(/<w:ind\s+[^>]*?\/>/, indXml);
    } else {
      formattedP = formattedP.replace('<w:pPr>', `<w:pPr>${indXml}`);
    }
  } else {
    formattedP = formattedP.replace('<w:p>', `<w:p><w:pPr>${indXml}</w:pPr>`);
  }
  return formattedP;
}

async function processDocument() {
  console.log("Loading input docx:", INPUT_PATH);
  const fileData = FS.readFileSync(INPUT_PATH);
  const zip = await JSZip.loadAsync(fileData);
  let docXml = await zip.file("word/document.xml").async("string");

  // Ensure Heading1 style in styles.xml
  let stylesXml = zip.file("word/styles.xml") ? await zip.file("word/styles.xml").async("string") : "";
  if (stylesXml && !stylesXml.includes('w:styleId="Heading1"')) {
    const heading1StyleXml = `<w:style w:type="paragraph" w:styleId="Heading1">
      <w:name w:val="heading 1"/>
      <w:basedOn w:val="Normal"/>
      <w:next w:val="Normal"/>
      <w:qFormat/>
      <w:pPr>
        <w:keepNext/>
        <w:spacing w:before="480" w:after="240"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:rPr>
        <w:b/>
        <w:bCs/>
        <w:sz w:val="36"/>
        <w:szCs w:val="36"/>
      </w:rPr>
    </w:style>`;
    stylesXml = stylesXml.replace('</w:styles>', `${heading1StyleXml}</w:styles>`);
    zip.file("word/styles.xml", stylesXml);
  }

  const bodyMatch = docXml.match(/(<w:body>)([\s\S]*?)(<\/w:body>)/);
  if (!bodyMatch) throw new Error("Could not find w:body in document.xml");

  const bodyPrefix = bodyMatch[1];
  const bodyContent = bodyMatch[2];
  const bodySuffix = bodyMatch[3];

  const pRegex = /<w:p(?:\s+[^>]*?)?>[\s\S]*?<\/w:p>/g;
  let pList = bodyContent.match(pRegex) || [];
  console.log(`Original paragraph count: ${pList.length}`);

  let newParagraphs = [];
  let isFirstParagraphAfterHeading = false;
  let inTocBlock = false;
  let forewordCount = 0;

  for (let i = 0; i < pList.length; i++) {
    const pXml = pList[i];
    const text = extractParagraphText(pXml);

    if (!text) continue;

    // Artifact Filter 1: Running Headers (exact match/trimmed lines)
    if (/^Tanitoluwa Adeniba,\s*Ph\.?D\.?$/i.test(text) || 
        /^THE HO\s?US\s?E\s?W\s?A\s?S\s?NEVER\s?Q\s?UIET$/i.test(text) ||
        /^THE HOUSE WAS NEVER QUIET$/i.test(text)) {
      console.log(`Stripped print header: "${text}"`);
      continue;
    }

    // Artifact Filter 2: Standalone print page numbers
    if (/^\d{1,3}$/.test(text) && i > 15) {
      console.log(`Stripped page number: "${text}"`);
      continue;
    }

    // Table of Contents Section Block Start
    if (/^CONTENTS$/i.test(text) && i < 200) {
      inTocBlock = true;
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("Contents"));
      continue;
    }

    // Inside Table of Contents Block
    if (inTocBlock) {
      if (/^A NOTE TO THE READER$/i.test(text) || i > 250) {
        inTocBlock = false;
      } else {
        // Build clean TOC line
        let cleanToc = text.replace(/(\D+)\d+$/, '$1').trim();
        if (/^Chapter\s+\d+$/i.test(cleanToc) && i + 1 < pList.length) {
          const nextText = extractParagraphText(pList[i + 1]);
          if (nextText) {
            let nextClean = nextText.replace(/(\D+)\d+$/, '$1').trim();
            cleanToc = `${cleanToc}: ${nextClean}`;
            i++; // skip next line
          }
        }
        newParagraphs.push(createTocItemXml(cleanToc));
        continue;
      }
    }

    // Front Matter: DEDICATION
    if (/^DEDICATION$/i.test(text) && i < 100) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("Dedication"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Front Matter: A NOTE TO THE READER
    if (/^A NOTE TO THE READER$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("A Note to the Reader"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Front Matter: FOREWORD
    if (/^FOREWORD$/i.test(text) && i < 400) {
      forewordCount++;
      const forewordTitle = forewordCount === 1 
        ? "Foreword by Bishop Funke Felix-Adejumo"
        : "Foreword by Titilola Vivour-Adeniyi";
      
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml(forewordTitle));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Front Matter: PROLOGUE
    if (/^PROLOGUE$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("Prologue"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Chapter Starts in Body Text: CHAPTER 1 .. 13 (after p250)
    let chapterMatch = text.match(/^CHAPTER\s+(\d+)\b/i);
    if (chapterMatch && i > 250) {
      const chNum = parseInt(chapterMatch[1], 10);
      const chInfo = CHAPTER_DETAILS.find(c => c.number === chNum);
      if (chInfo) {
        newParagraphs.push(createPageBreakXml());
        newParagraphs.push(createHeading1Xml(chInfo.title));
        isFirstParagraphAfterHeading = true;

        // Skip potential duplicate chapter header / subtitle lines immediately following
        let peekIdx = i + 1;
        while (peekIdx < pList.length && peekIdx <= i + 3) {
          const peekText = extractParagraphText(pList[peekIdx]);
          if (!peekText) { peekIdx++; continue; }
          if (/^CHAPTER\s+\d+\b/i.test(peekText) || 
              /^THE VIOLENCE WE DON’T NAME$/i.test(peekText) ||
              /^THE HOUSE THAT LIVES INSIDE US$/i.test(peekText) ||
              /^MOTHERS IN THE MIDDLE$/i.test(peekText) ||
              /^THE VIOLENCE THAT DOESN’T LEAVE MARKS$/i.test(peekText) ||
              /^THE BURDEN OF ENDURANCE$/i.test(peekText) ||
              /^WHAT THE CHILDREN SEE/i.test(peekText) ||
              /^MONEY, POWER, AND THE QUIET ECONOMY/i.test(peekText) ||
              /^THE OTHER SIDE OF FATHER INVOLVEMENT$/i.test(peekText) ||
              /^SISTERS IN THE SHADOW/i.test(peekText) ||
              /^FAMILY AND THE WEIGHT OF EXPECTATIONS$/i.test(peekText) ||
              /^WHEN FAITH DEMANDS SILENCE$/i.test(peekText) ||
              /^EMBRACING AND QUESTIONING TRADITION/i.test(peekText) ||
              /^BEYOND SURVIVAL/i.test(peekText)) {
            console.log(`Skipped duplicate title line [p${peekIdx + 1}]: "${peekText}"`);
            i = peekIdx;
            peekIdx++;
          } else {
            break;
          }
        }
        continue;
      }
    }

    // Back Matter: ACKNOWLEDGEMENTS
    if (/^ACKNOWLEDGEMENTS$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("Acknowledgements"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Back Matter: RESOURCES AND SUPPORT
    if (/^RESOURCES AND SUPPORT$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("Resources and Support"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Back Matter: END NOTES
    if (/^END NOTES$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("End Notes"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Back Matter: ABOUT THE AUTHOR
    if (/^ABOUT THE AUTHOR$/i.test(text)) {
      newParagraphs.push(createPageBreakXml());
      newParagraphs.push(createHeading1Xml("About the Author"));
      isFirstParagraphAfterHeading = true;
      continue;
    }

    // Normal Body Paragraph
    const formatted = formatBodyParagraphXml(pXml, isFirstParagraphAfterHeading);
    if (formatted) {
      newParagraphs.push(formatted);
      isFirstParagraphAfterHeading = false;
    }
  }

  console.log(`Reconstructed paragraph count: ${newParagraphs.length}`);

  const newBodyXml = `${bodyPrefix}\n${newParagraphs.join('\n')}\n${bodySuffix}`;
  zip.file("word/document.xml", newBodyXml);

  console.log("Saving output docx:", OUTPUT_PATH);
  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  FS.writeFileSync(OUTPUT_PATH, outBuf);
  console.log("Successfully created Kindle Ready docx!");
}

processDocument().catch(err => {
  console.error("Error processing document:", err);
  process.exit(1);
});
