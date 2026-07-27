const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const INPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx";
const OUTPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean.docx";

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

const TOC_STRUCTURE = [
  "Dedication",
  "A Note to the Reader",
  "Foreword by Bishop Funke Felix-Adejumo",
  "Foreword by Titilola Vivour-Adeniyi",
  "Prologue",
  "Chapter 1: The Violence We Don’t Name",
  "Chapter 2: The House That Lives Inside Us",
  "Chapter 3: Mothers in the Middle",
  "Chapter 4: The Violence That Doesn’t Leave Marks",
  "Chapter 5: The Burden of Endurance",
  "Chapter 6: What the Children See (And What We Think They Don’t)",
  "Chapter 7: Money, Power, and the Quiet Economy of Control",
  "Chapter 8: The Other Side of Father Involvement",
  "Chapter 9: Sisters in the Shadow — Solidarity, Sharing, and Quiet Resistance",
  "Chapter 10: Family and the Weight of Expectations",
  "Chapter 11: When Faith Demands Silence",
  "Chapter 12: Embracing and Questioning Tradition: A Personal Reflection",
  "Chapter 13: Beyond Survival—Reimagining Safety, Family, and Flourishing",
  "Acknowledgements",
  "Resources and Support",
  "End Notes",
  "About the Author"
];

function getNodeText(pNode) {
  const tNodes = pNode.getElementsByTagName('w:t');
  let text = '';
  for (let i = 0; i < tNodes.length; i++) {
    text += tNodes[i].textContent;
  }
  return text.trim();
}

function setNodeText(pNode, newText, doc) {
  const tNodes = pNode.getElementsByTagName('w:t');
  if (tNodes.length > 0) {
    tNodes[0].textContent = newText;
    for (let i = tNodes.length - 1; i > 0; i--) {
      tNodes[i].parentNode.removeChild(tNodes[i]);
    }
  } else {
    const rNode = doc.createElement('w:r');
    const tNode = doc.createElement('w:t');
    tNode.textContent = newText;
    rNode.appendChild(tNode);
    pNode.appendChild(rNode);
  }
}

function setParagraphStyle(pNode, styleVal, doc) {
  let pPr = pNode.getElementsByTagName('w:pPr')[0];
  if (!pPr) {
    pPr = doc.createElement('w:pPr');
    pNode.insertBefore(pPr, pNode.firstChild);
  }
  let pStyle = pPr.getElementsByTagName('w:pStyle')[0];
  if (!pStyle) {
    pStyle = doc.createElement('w:pStyle');
    pPr.appendChild(pStyle);
  }
  pStyle.setAttribute('w:val', styleVal);
}

function createPageBreakNode(doc) {
  const p = doc.createElement('w:p');
  const r = doc.createElement('w:r');
  const br = doc.createElement('w:br');
  br.setAttribute('w:type', 'page');
  r.appendChild(br);
  p.appendChild(r);
  return p;
}

function createTocItemNode(text, doc) {
  const p = doc.createElement('w:p');
  const pPr = doc.createElement('w:pPr');
  const pStyle = doc.createElement('w:pStyle');
  pStyle.setAttribute('w:val', 'TOC1');
  const spacing = doc.createElement('w:spacing');
  spacing.setAttribute('w:before', '120');
  spacing.setAttribute('w:after', '120');
  pPr.appendChild(pStyle);
  pPr.appendChild(spacing);
  p.appendChild(pPr);

  const r = doc.createElement('w:r');
  const rPr = doc.createElement('w:rPr');
  const sz = doc.createElement('w:sz');
  sz.setAttribute('w:val', '24'); // 12pt font
  rPr.appendChild(sz);
  r.appendChild(rPr);

  const t = doc.createElement('w:t');
  t.textContent = text;
  r.appendChild(t);
  p.appendChild(r);
  return p;
}

async function buildMasterDocx() {
  console.log("Building master, perfectly formatted docx...");
  const fileData = FS.readFileSync(INPUT_PATH);
  const zip = await JSZip.loadAsync(fileData);
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  // Ensure Heading1 style in styles.xml
  let stylesXmlStr = zip.file("word/styles.xml") ? await zip.file("word/styles.xml").async("string") : "";
  if (stylesXmlStr && !stylesXmlStr.includes('w:styleId="Heading1"')) {
    const heading1StyleXml = `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="480" w:after="240"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>`;
    stylesXmlStr = stylesXmlStr.replace('</w:styles>', `${heading1StyleXml}</w:styles>`);
    zip.file("word/styles.xml", stylesXmlStr);
  }

  const bodyNode = doc.getElementsByTagName('w:body')[0];
  const pNodes = Array.from(doc.getElementsByTagName('w:p'));

  let inTocBlock = false;
  let forewordCount = 0;
  let tocRebuilt = false;

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    if (!pNode.parentNode) continue;

    const text = getNodeText(pNode);

    // 1. Remove empty spacer paragraphs that cause vertical blank gaps
    if (!text) {
      // Do not remove page breaks or image drawings
      const hasBr = pNode.getElementsByTagName('w:br').length > 0;
      const hasDrawing = pNode.getElementsByTagName('w:drawing').length > 0;
      if (!hasBr && !hasDrawing) {
        pNode.parentNode.removeChild(pNode);
        continue;
      }
    }

    // 2. Strip print running headers
    if (/^Tanitoluwa Adeniba,\s*Ph\.?D\.?$/i.test(text) || 
        /^THE HO\s?US\s?E\s?W\s?A\s?S\s?NEVER\s?Q\s?UIET$/i.test(text) ||
        /^THE HOUSE WAS NEVER QUIET$/i.test(text)) {
      pNode.parentNode.removeChild(pNode);
      continue;
    }

    // 3. Strip standalone print page numbers
    if (/^\d{1,3}$/.test(text) && i > 15) {
      pNode.parentNode.removeChild(pNode);
      continue;
    }

    // 4. Remove accidental bullet points on normal narrative body paragraphs (> 100 chars without explicit •)
    const numPr = pNode.getElementsByTagName('w:numPr')[0];
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';
    const isHeading = styleVal === 'Heading1' || /^Heading/i.test(styleVal);
    const isExplicitBullet = /^[•\-\*▪\u2022\u2013\u2014]/.test(text);

    if ((numPr || /List/i.test(styleVal)) && !isHeading && !isExplicitBullet) {
      if (numPr) numPr.parentNode.removeChild(numPr);
      if (pStyle) pStyle.setAttribute('w:val', 'Normal');
    }

    // 5. Table of Contents Rebuild
    if (/^CONTENTS$/i.test(text) && i < 200) {
      inTocBlock = true;
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Contents', doc);

      if (!tocRebuilt) {
        // Insert clean TOC items immediately after CONTENTS heading
        let refNode = pNode.nextSibling;
        for (const item of TOC_STRUCTURE) {
          const tocNode = createTocItemNode(item, doc);
          pNode.parentNode.insertBefore(tocNode, refNode);
        }
        tocRebuilt = true;
      }
      continue;
    }

    if (inTocBlock) {
      if (/^A NOTE TO THE READER$/i.test(text) || i > 250) {
        inTocBlock = false;
      } else {
        // Delete original messy TOC paragraphs
        pNode.parentNode.removeChild(pNode);
        continue;
      }
    }

    // Front Matter
    if (/^DEDICATION$/i.test(text) && i < 100) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Dedication', doc);
      continue;
    }

    if (/^A NOTE TO THE READER$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'A Note to the Reader', doc);
      continue;
    }

    if (/^FOREWORD$/i.test(text) && i < 400) {
      forewordCount++;
      const forewordTitle = forewordCount === 1 
        ? "Foreword by Bishop Funke Felix-Adejumo"
        : "Foreword by Titilola Vivour-Adeniyi";
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, forewordTitle, doc);
      continue;
    }

    if (/^PROLOGUE$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Prologue', doc);
      continue;
    }

    // Body Chapters 1 .. 13
    let chapterMatch = text.match(/^CHAPTER\s+(\d+)\b/i);
    if (chapterMatch && i > 250) {
      const chNum = parseInt(chapterMatch[1], 10);
      const chInfo = CHAPTER_DETAILS.find(c => c.number === chNum);
      if (chInfo) {
        const pb = createPageBreakNode(doc);
        pNode.parentNode.insertBefore(pb, pNode);
        setParagraphStyle(pNode, 'Heading1', doc);
        setNodeText(pNode, chInfo.title, doc);

        let peekIdx = i + 1;
        while (peekIdx < pNodes.length && peekIdx <= i + 3) {
          const peekNode = pNodes[peekIdx];
          if (!peekNode || !peekNode.parentNode) { peekIdx++; continue; }
          const peekText = getNodeText(peekNode);
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
            peekNode.parentNode.removeChild(peekNode);
            peekIdx++;
          } else {
            break;
          }
        }
        continue;
      }
    }

    // Back Matter
    if (/^ACKNOWLEDGEMENTS$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Acknowledgements', doc);
      continue;
    }
    if (/^RESOURCES AND SUPPORT$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Resources and Support', doc);
      continue;
    }
    if (/^END NOTES$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'End Notes', doc);
      continue;
    }
    if (/^ABOUT THE AUTHOR$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'About the Author', doc);
      continue;
    }
  }

  const serializer = new XMLSerializer();
  const newDocXmlStr = serializer.serializeToString(doc);

  zip.file("word/document.xml", newDocXmlStr);
  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  try {
    FS.writeFileSync(OUTPUT_PATH, outBuf);
    console.log(`Successfully written master docx to ${OUTPUT_PATH}`);
  } catch (e) {
    const fallback = OUTPUT_PATH.replace('.docx', '_V2.docx');
    FS.writeFileSync(fallback, outBuf);
    console.log(`Written to fallback path: ${fallback}`);
  }
}

buildMasterDocx().catch(err => console.error(err));
