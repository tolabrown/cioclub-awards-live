const FS = require('fs');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const INPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The House Was Never Quiet_June 23_final.WORD e book.docx";
const OUTPUT_PATH = "C:\\Users\\TOLAN\\Downloads\\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V3.docx";

const CHAPTER_MAP = [
  { num: 1, title: "Chapter 1: The Violence We Don’t Name" },
  { num: 2, title: "Chapter 2: The House That Lives Inside Us" },
  { num: 3, title: "Chapter 3: Mothers in the Middle" },
  { num: 4, title: "Chapter 4: The Violence That Doesn’t Leave Marks" },
  { num: 5, title: "Chapter 5: The Burden of Endurance" },
  { num: 6, title: "Chapter 6: What the Children See (And What We Think They Don’t)" },
  { num: 7, title: "Chapter 7: Money, Power, and the Quiet Economy of Control" },
  { num: 8, title: "Chapter 8: The Other Side of Father Involvement" },
  { num: 9, title: "Chapter 9: Sisters in the Shadow — Solidarity, Sharing, and Quiet Resistance" },
  { num: 10, title: "Chapter 10: Family and the Weight of Expectations" },
  { num: 11, title: "Chapter 11: When Faith Demands Silence" },
  { num: 12, title: "Chapter 12: Embracing and Questioning Tradition: A Personal Reflection" },
  { num: 13, title: "Chapter 13: Beyond Survival—Reimagining Safety, Family, and Flourishing" }
];

const TOC_ITEMS = [
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
  for (let i = 0; i < tNodes.length; i++) text += tNodes[i].textContent;
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
  pPr.appendChild(pStyle);
  p.appendChild(pPr);

  const r = doc.createElement('w:r');
  const t = doc.createElement('w:t');
  t.textContent = text;
  r.appendChild(t);
  p.appendChild(r);
  return p;
}

async function fixKindleCreatePerfection() {
  console.log("Fixing all Kindle Create misalignments in DOM...");
  const fileData = FS.readFileSync(INPUT_PATH);
  const zip = await JSZip.loadAsync(fileData);
  const docXmlStr = await zip.file("word/document.xml").async("string");

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXmlStr, "text/xml");

  const pNodes = Array.from(doc.getElementsByTagName('w:p'));
  let inTocBlock = false;
  let forewordCount = 0;
  let tocInserted = false;
  let lastSeenText = "";

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    if (!pNode.parentNode) continue;

    const text = getNodeText(pNode);

    // 1. Remove empty spacer paragraphs (except page breaks / drawings)
    if (!text) {
      const hasBr = pNode.getElementsByTagName('w:br').length > 0;
      const hasDrawing = pNode.getElementsByTagName('w:drawing').length > 0;
      if (!hasBr && !hasDrawing) {
        pNode.parentNode.removeChild(pNode);
        continue;
      }
    }

    // 2. Remove exact duplicate consecutive banner/heading callout text
    if (text && text === lastSeenText && text.length > 10 && !/^(Chapter|\d+$)/.test(text)) {
      pNode.parentNode.removeChild(pNode);
      continue;
    }
    if (text) lastSeenText = text;

    // 3. Strip print running headers
    if (/^Tanitoluwa Adeniba,\s*Ph\.?D\.?$/i.test(text) || 
        /^THE HO\s?US\s?E\s?W\s?A\s?S\s?NEVER\s?Q\s?UIET$/i.test(text) ||
        /^THE HOUSE WAS NEVER QUIET$/i.test(text)) {
      pNode.parentNode.removeChild(pNode);
      continue;
    }

    // 4. Strip standalone page numbers
    if (/^\d{1,3}$/.test(text) && i > 15) {
      pNode.parentNode.removeChild(pNode);
      continue;
    }

    // 5. Demote ALL original heading styles (Heading1, Heading2, Title, etc.) to Normal first, so we only promote our 23 official sections!
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    const styleVal = pStyle ? pStyle.getAttribute('w:val') : '';

    if (styleVal === 'Title' || /^Heading/i.test(styleVal)) {
      pStyle.setAttribute('w:val', 'Normal');
    }

    // 6. Strip accidental numPr (bullet list) from regular narrative body text
    const numPr = pNode.getElementsByTagName('w:numPr')[0];
    const isExplicitBullet = /^[•\-\*▪\u2022\u2013\u2014]/.test(text);

    if ((numPr || /List/i.test(styleVal)) && !isExplicitBullet) {
      if (numPr) numPr.parentNode.removeChild(numPr);
      setParagraphStyle(pNode, 'Normal', doc);
    }

    // 7. Table of Contents Block
    if (/^CONTENTS$/i.test(text) && i < 200) {
      inTocBlock = true;
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Contents', doc);

      if (!tocInserted) {
        let ref = pNode.nextSibling;
        for (const item of TOC_ITEMS) {
          const itemNode = createTocItemNode(item, doc);
          pNode.parentNode.insertBefore(itemNode, ref);
        }
        tocInserted = true;
      }
      continue;
    }

    if (inTocBlock) {
      if (/^A NOTE TO THE READER$/i.test(text) || i > 250) {
        inTocBlock = false;
      } else {
        pNode.parentNode.removeChild(pNode);
        continue;
      }
    }

    // 8. Front Matter Section Headings
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
      const fTitle = forewordCount === 1 
        ? "Foreword by Bishop Funke Felix-Adejumo"
        : "Foreword by Titilola Vivour-Adeniyi";
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, fTitle, doc);
      continue;
    }

    if (/^PROLOGUE$/i.test(text)) {
      const pb = createPageBreakNode(doc);
      pNode.parentNode.insertBefore(pb, pNode);
      setParagraphStyle(pNode, 'Heading1', doc);
      setNodeText(pNode, 'Prologue', doc);
      continue;
    }

    // 9. Chapter Starts (Chapters 1 .. 13)
    let chapterMatch = text.match(/^CHAPTER\s+(\d+)\b/i);
    if (chapterMatch && i > 250) {
      const chNum = parseInt(chapterMatch[1], 10);
      const chInfo = CHAPTER_MAP.find(c => c.num === chNum);
      if (chInfo) {
        const pb = createPageBreakNode(doc);
        pNode.parentNode.insertBefore(pb, pNode);
        setParagraphStyle(pNode, 'Heading1', doc);
        setNodeText(pNode, chInfo.title, doc);

        // Delete any adjacent duplicate title text lines
        let next = pNode.nextSibling;
        while (next) {
          const nextP = next;
          next = next.nextSibling;
          if (nextP.nodeName === 'w:p') {
            const nextText = getNodeText(nextP);
            if (!nextText || 
                /^CHAPTER\s+\d+\b/i.test(nextText) || 
                nextText.startsWith("Chapter ") ||
                /^THE VIOLENCE WE DON’T NAME$/i.test(nextText) ||
                /^THE HOUSE THAT LIVES INSIDE US$/i.test(nextText) ||
                /^MOTHERS IN THE MIDDLE$/i.test(nextText) ||
                /^THE VIOLENCE THAT DOESN’T LEAVE MARKS$/i.test(nextText) ||
                /^THE BURDEN OF ENDURANCE$/i.test(nextText) ||
                /^WHAT THE CHILDREN SEE/i.test(nextText) ||
                /^MONEY, POWER, AND THE QUIET ECONOMY/i.test(nextText) ||
                /^THE OTHER SIDE OF FATHER INVOLVEMENT$/i.test(nextText) ||
                /^SISTERS IN THE SHADOW/i.test(nextText) ||
                /^FAMILY AND THE WEIGHT OF EXPECTATIONS$/i.test(nextText) ||
                /^WHEN FAITH DEMANDS SILENCE$/i.test(nextText) ||
                /^EMBRACING AND QUESTIONING TRADITION/i.test(nextText) ||
                /^BEYOND SURVIVAL/i.test(nextText)) {
              if (nextP.parentNode) nextP.parentNode.removeChild(nextP);
            } else {
              break;
            }
          }
        }
        continue;
      }
    }

    // 10. Back Matter Section Headings
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
    console.log(`Master V3 docx written successfully to ${OUTPUT_PATH}`);
  } catch (e) {
    const fallback = OUTPUT_PATH.replace('.docx', '_Final.docx');
    FS.writeFileSync(fallback, outBuf);
    console.log(`Written to fallback: ${fallback}`);
  }
}

fixKindleCreatePerfection().catch(err => console.error(err));
