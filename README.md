# Webscraper

A simple concurrent web crawler built with TypeScript.

It crawls a given website, extracts structured data from each page, and outputs the results as a JSON report.

---

## Features

- Concurrent crawling with configurable limits
- Domain-restricted crawling (stays within the target site)
- HTML parsing using JSDOM
- Extracts structured page data:
  - URL
  - Heading
  - First paragraph
  - Outgoing links
  - Image URLs
- Outputs results to a JSON file

---

## Usage

```bash
npm run start <URL> <maxConcurrency> <maxPages>
```

### Arguments

- URL - The starting point for the crawler  
- maxConcurrency - Maximum number of concurrent requests  
- maxPages - Maximum number of unique pages to crawl  

### Example

```bash
npm run start https://example.com 3 10
```

---

## Output

After running, a report.json file will be generated in the project root.

Example:

```json
[
  {
    "url": "https://example.com",
    "heading": "Example Domain",
    "first_paragraph": "This domain is for use in documentation examples without needing permission. Avoid use in operations.",
    "outgoing_links": [
      "https://iana.org/domains/example"
    ],
    "image_urls": []
  }
]
```

---

## How it Works

1. Starts from a base URL  
2. Fetches and parses HTML content  
3. Extracts structured data from the page  
4. Recursively follows internal links  
5. Respects concurrency and page limits  
6. Outputs results as a sorted JSON report  

---

## Tech Stack

- TypeScript  
- Node.js  
- JSDOM  
- p-limit  

---

## Notes

- Only crawls pages within the same domain  
- Designed as a learning project to explore backend concepts such as:
  - recursion  
  - concurrency control  
  - data extraction  
  - CLI tooling  

---

## Future Improvements

- Better error handling and retries  
- Configurable logging levels  
- Output formatting options  
- Support for different extraction strategies  
- Rate limiting and politeness delays  

---

## Getting Started

```bash
npm install  
npm run start <URL> <maxConcurrency> <maxPages>
```

---

## License

MIT