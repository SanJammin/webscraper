import { JSDOM } from "jsdom";
import pLimit from "p-limit";

export function normalizeURL(url: string): string {
    const urlObj = new URL(url);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    return hostPath.toLowerCase().replace(/\/$/, "");
}

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const h1 = dom.window.document.querySelector("h1");
    const h2 = dom.window.document.querySelector("h2");
    if (h1) {
        return h1.textContent?.trim() || "";
    } else if (h2) {
        return h2.textContent?.trim() || "";
    } else {
        return "";
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const p = dom.window.document.querySelector("p");
    const main = dom.window.document.querySelector("main");
    if (main) {
        const mainP = main.querySelector("p");
        if (mainP) {
            return mainP.textContent?.trim() || "";
        }
    }
    
    if (p) {
        return p.textContent?.trim() || "";
    }

    return "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const aTags = dom.window.document.querySelectorAll("a");
    const urls: string[] = [];
    aTags.forEach((aTag) => {
        const href = aTag.getAttribute("href");
        if (href) {
            try {
                const urlObj = new URL(href, baseURL);
                if (urlObj.pathname === "/") {
                    urls.push(urlObj.origin + urlObj.search + urlObj.hash);
                } else {
                    urls.push(urlObj.href);
                }
            } catch (error) {
                console.log(`Invalid URL: ${href} - ${error}`);
            }
        }
    });
    return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const imgTags = dom.window.document.querySelectorAll("img");
    const imageURLs: string[] = [];
    imgTags.forEach((imgTag) => {
        const src = imgTag.getAttribute("src");
        if (src) {
            try {
                const urlObj = new URL(src, baseURL);
                imageURLs.push(urlObj.href);
            } catch (error) {
                console.log(`Invalid image URL: ${src} - ${error}`);
            }
        }
    });
    return imageURLs;
}

type ExtractedPageData = {
    heading: string;
    description: string;
    outgoing_links: string[];
    image_links: string[];
    url: string;
};

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    return {
        heading: getHeadingFromHTML(html),
        description: getFirstParagraphFromHTML(html),
        outgoing_links: getURLsFromHTML(html, pageURL),
        image_links: getImagesFromHTML(html, pageURL),
        url: pageURL
    };
}

export class ConcurrentCrawler {
    baseURL: string;
    pages: Record<string, ExtractedPageData>;
    limit: ReturnType<typeof pLimit>;
    maxPages: number;
    shouldStop: boolean;
    allTasks: Set<Promise<void>>;

    constructor(baseURL: string, maxConcurrency: number, maxPages: number) {
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) {
            return false;
        }

        if (this.pages[normalizedURL]) {
            return false;
        }

        if(Object.keys(this.pages).length >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            return false;
        }

        return true;
    }

    private async getHTML(url: string): Promise<string> {
        return await this.limit(async () => {
            try {
                const response = await fetch(url, {
                    headers: {"User-Agent": "BootCrawler/1.0"}
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                } else if (!response.headers.get("content-type")?.includes("text/html")) {
                    throw new Error(`Non-HTML content at ${url}: ${response.headers.get("content-type")}`);
                }

                const html = await response.text();
                return html;
            } catch (error) {
                console.error("Error fetching:", url, error);
                return "";
            }
        });
    }

    private async crawlPage(currentURL: string): Promise<void> {
        const normalizedCurrentURL = normalizeURL(currentURL);
        const baseHost = new URL(this.baseURL).hostname;
        const currentHost = new URL(currentURL).hostname;

        if (this.shouldStop) {
            return;
        }

        if (baseHost !== currentHost) {
            console.log(`Skipping ${currentURL} - outside of base URL`);
            return;
        }

        if(!this.addPageVisit(normalizedCurrentURL)) {
            return;
        }

        console.log(`Crawling ${currentURL}`);
        const html = await this.getHTML(currentURL);
        console.log(`Fetched ${currentURL} - length: ${html.length}`);

        const data = extractPageData(html, currentURL);
        this.pages[normalizedCurrentURL] = data;
        if (data.outgoing_links.length === 0) {
            console.log(`No links found on ${currentURL}`);
        } else {
            console.log(`Found ${data.outgoing_links.length} links on ${currentURL}`);
            const tasks = data.outgoing_links.map((url) => {
                const task = this.crawlPage(url).finally(() => {
                    this.allTasks.delete(task);
                });
                this.allTasks.add(task);
                return task;
            });
            await Promise.all(tasks);
        }
    }

    async crawl(): Promise<Record<string, ExtractedPageData>> {
        await this.crawlPage(this.baseURL);
        return this.pages;
    }
}

export async function crawlSiteAsync(
    baseURL: string, 
    maxConcurrency: number,
    maxPages: number
): Promise<Record<string, ExtractedPageData>> {
    const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
    return await crawler.crawl();
}