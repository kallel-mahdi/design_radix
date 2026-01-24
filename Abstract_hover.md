# Citation Hover with Abstract - Implementation Guide

## Overview

This document outlines the complete pipeline for implementing a "hover on citation to show abstract" feature in a PDF reader.

---

## Pipeline Stages

### Stage 1: Detect Citation Locations in PDF

**Goal:** Find bounding boxes for [1], [2], (Smith, 2020) in the PDF

| Option | How | Coverage | Effort |
|--------|-----|----------|--------|
| **A. PDF Link Annotations** | `page.getAnnotations()` | ~40-60% | Easiest |
| **B. Text Layer + Pattern Matching** | `page.getTextContent()` + regex | ~90% | Medium |
| **C. GROBID** | ML server, returns coords in XML | ~95% | Heavy |

**Recommendation:** A → B fallback

```typescript
// Option A: PDF Link Annotations (if they exist)
async function getCitationLinksFromAnnotations(page: PDFPageProxy) {
  const annotations = await page.getAnnotations();
  return annotations
    .filter(a => a.subtype === 'Link' && a.dest)
    .map(a => ({
      rect: a.rect,  // [x1, y1, x2, y2]
      dest: a.dest,
      page: page.pageNumber
    }));
}

// Option B: Text Layer + Regex (fallback)
async function getCitationLocationsFromText(page: PDFPageProxy) {
  const textContent = await page.getTextContent();
  const citations = [];

  const pattern = /\[(\d+(?:[,\-–]\d+)*)\]/g;  // [1], [1,2], [1-3]

  for (const item of textContent.items) {
    let match;
    while ((match = pattern.exec(item.str)) !== null) {
      citations.push({
        refNumber: parseRefNumbers(match[1]),
        bbox: {
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height
        },
        page: page.pageNumber
      });
    }
  }
  return citations;
}
```

---

### Stage 2: Link Citations to References

**Goal:** Map [1] → actual reference entry

| Option | How | Accuracy |
|--------|-----|----------|
| **A. PDF Internal Link Destinations** | Follow `annotation.dest` to ref section | High (if exists) |
| **B. Number Ordering** | [1] = 1st reference, [2] = 2nd | Works for numbered refs |
| **C. Semantic Scholar API** | Returns ordered reference list | High (if DOI exists) |

**Recommendation:** Use Semantic Scholar API if main paper has DOI

---

### Stage 3: Extract Identifiers from References

**Goal:** Get DOI, arXiv ID, or title from each reference

| Option | How | Accuracy |
|--------|-----|----------|
| **A. Semantic Scholar API** | Already returns DOIs for each reference | Best |
| **B. Regex on Reference Text** | `/10\.\d{4,9}\/[^\s]+/` for DOI | Good |
| **C. GROBID** | Parses each reference into structured fields | Best (heavy) |

**Recommendation:** Semantic Scholar (included in references response)

---

### Stage 4: Fetch Metadata (Abstracts)

**Goal:** Get title, authors, abstract for each reference

| API | Rate Limit | Has Abstract? |
|-----|------------|---------------|
| **Semantic Scholar** | 1000/sec free | Yes |
| **OpenAlex** | 10/sec polite | Yes (inverted index) |
| **Crossref** | 50/sec polite | Sometimes |

**Recommendation:** Semantic Scholar

```typescript
// ONE API call gets ALL references with abstracts
async function fetchReferencesWithAbstracts(mainPaperDoi: string) {
  const response = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/DOI:${mainPaperDoi}/references` +
    `?fields=title,abstract,authors,year,venue,externalIds&limit=1000`,
    { headers: { 'User-Agent': 'BibliographyManager/1.0' } }
  );

  const { data } = await response.json();

  return data.map((ref, index) => ({
    refNumber: index + 1,
    paperId: ref.citedPaper.paperId,
    title: ref.citedPaper.title,
    abstract: ref.citedPaper.abstract,
    authors: ref.citedPaper.authors,
    year: ref.citedPaper.year,
    doi: ref.citedPaper.externalIds?.DOI,
    arxivId: ref.citedPaper.externalIds?.ArXiv
  }));
}
```

---

### Stage 5: Cache

**Goal:** Store results for fast subsequent loads

- Cache references per paper in database
- Key by main paper DOI or internal ID
- Invalidate rarely (references don't change)

---

### Stage 6: Display

**Goal:** Show tooltip on hover

```typescript
function onCitationHover(refNumber: number, cachedRefs: Reference[]) {
  const ref = cachedRefs.find(r => r.refNumber === refNumber);
  if (ref?.abstract) {
    showTooltip({
      title: ref.title,
      authors: ref.authors?.map(a => a.name).join(', '),
      year: ref.year,
      abstract: ref.abstract,
      doi: ref.doi
    });
  }
}
```

---

## Recommended Pipeline (Simplest Path)

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 1: Detect Locations                                   │
│ getAnnotations() → if empty → getTextContent() + regex      │
│ Output: [{refNumber: 1, bbox: [x,y,w,h], page: 3}, ...]    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 2+3+4: Get Reference Data (ONE API CALL)              │
│ Semantic Scholar: GET /paper/DOI:{mainPaperDoi}/references  │
│ Output: [{paperId, title, authors, abstract, DOI}, ...]    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 5: Cache                                              │
│ Map refNumber → reference data (by order)                   │
│ Store in DB for future loads                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 6: Display                                            │
│ On hover [1] → show tooltip with abstract                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Insight

If you have the main paper's DOI, **Semantic Scholar collapses Stages 2-4 into ONE API call** that returns all references with abstracts. No PDF parsing needed for metadata.

---

## What Competitors Use

| Tool | Stage 1 (Location) | Stage 2-4 (Data) |
|------|-------------------|------------------|
| **Google Scholar PDF Reader** | `getAnnotations()` + `getTextContent()` (proprietary ML) | Google Scholar API (private) |
| **Zotero 7** | PDF internal links | Crossref API |
| **zotero-reference plugin** | Text parsing | Crossref + Semantic Scholar |
| **RefDive** | Text layer + heuristics (~75% coverage) | None (just links to ref section) |
| **ResearchGate** | GROBID | GROBID + internal DB |
| **Semantic Scholar** | GROBID | Internal DB |

---

## Summary

| Stage | Task | Recommendation |
|-------|------|----------------|
| 1 | Find citation locations | `getAnnotations()` → `getTextContent()` fallback |
| 2 | Link to references | Semantic Scholar API (or PDF link dest) |
| 3 | Extract identifiers | Semantic Scholar (included in response) |
| 4 | Fetch abstracts | Semantic Scholar (included in response) |
| 5 | Cache | Store in DB per paper |
| 6 | Display | Tooltip on hover |

---

## API Reference

### Semantic Scholar - Get References

```
GET https://api.semanticscholar.org/graph/v1/paper/{paper_id}/references
    ?fields=title,abstract,authors,year,venue,externalIds
    &limit=1000
```

**Paper ID formats:**
- DOI: `DOI:10.1234/abc`
- ArXiv: `ARXIV:2301.00001`
- Semantic Scholar ID: `649def34f8be52c8b66281af98ae884c09aef38b`

**Response:**
```json
{
  "data": [
    {
      "citedPaper": {
        "paperId": "abc123",
        "title": "Machine Learning",
        "abstract": "This paper presents...",
        "authors": [{"authorId": "123", "name": "John Smith"}],
        "year": 2023,
        "venue": "Nature",
        "externalIds": {
          "DOI": "10.1038/s41586-023-00001-1",
          "ArXiv": "2301.00001"
        }
      }
    }
  ]
}
```

**Rate Limits:** 1000 requests/sec (unauthenticated, shared)
