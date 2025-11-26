declare module '@orcid/bibtex-parse-js' {
  interface BibtexEntry {
    citationKey: string;
    entryType: string;
    entryTags: Record<string, string>;
  }

  interface BibtexParse {
    toJSON(bibtex: string): BibtexEntry[];
    toBibtex(entries: BibtexEntry[]): string;
  }

  const bibtexParse: BibtexParse;
  export = bibtexParse;
}
