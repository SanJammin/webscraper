import { expect, test } from "vitest";
import { normalizeURL } from "./crawl";
import { getHeadingFromHTML } from "./crawl";
import { getFirstParagraphFromHTML } from "./crawl";
import { getURLsFromHTML } from "./crawl";
import { getImagesFromHTML } from "./crawl";
import { extractPageData } from "./crawl";

test("removes https:// from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes http:// from url", () => {
    expect(normalizeURL("http://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes trailing slash from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes fragment from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path#section")).toBe("www.boot.dev/blog/path");
});

test("removes query string from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path?query=string")).toBe("www.boot.dev/blog/path");
});

test("handles uppercase letters in url", () => {
    expect(normalizeURL("HTTPS://WWW.BOOT.DEV/BLOG/PATH/")).toBe("www.boot.dev/blog/path");
});

test("return the text inside the first h1 tag in the html", () => {
    expect(getHeadingFromHTML("<html><body><h1>Test Heading</h1></body></html>")).toBe("Test Heading");
});

test("returns the text inside the first h1 tag even if there are multiple h1 tags", () => {
    expect(getHeadingFromHTML("<html><body><h1>First Heading</h1><h1>Second Heading</h1></body></html>")).toBe("First Heading");
});

test("handles h1 tags with attributes", () => {
    expect(getHeadingFromHTML("<html><body><h1 class='heading'>Heading with class</h1></body></html>")).toBe("Heading with class");
});

test("handles h1 tags with nested elements", () => {
    expect(getHeadingFromHTML("<html><body><h1>Heading with <span>nested</span> elements</h1></body></html>")).toBe("Heading with nested elements");
});

test("returns a h2 tag if there is no h1 tag", () => {
    expect(getHeadingFromHTML("<html><body><h2>Test Heading</h2></body></html>")).toBe("Test Heading");
});

test("returns an empty string if there are no h1 or h2 tags", () => {
    expect(getHeadingFromHTML("<html><body><p>No headings here</p></body></html>")).toBe("");
});

test("return first paragraph from html", () => {
    expect(getFirstParagraphFromHTML("<html><body><p>First paragraph</p><p>Second paragraph</p></body></html>")).toBe("First paragraph");
});

test("handles p tags with attributes", () => {
    expect(getFirstParagraphFromHTML("<html><body><p class='paragraph'>Paragraph with class</p></body></html>")).toBe("Paragraph with class");
});

test("handles p tags with nested elements", () => {
    expect(getFirstParagraphFromHTML("<html><body><p>Paragraph with <span>nested</span> elements</p></body></html>")).toBe("Paragraph with nested elements");
});

test("returns an empty string if there are no p tags", () => {
    expect(getFirstParagraphFromHTML("<html><body><h1>No paragraphs here</h1></body></html>")).toBe("");
});

test("returns the text content of the first p tag even if there are multiple p tags", () => {
    expect(getFirstParagraphFromHTML("<html><body><p>First paragraph</p><p>Second paragraph</p></body></html>")).toBe("First paragraph");
});

test("prioritises the return of the first p tag inside of a main section, rather than actual first p tag", () => {
    expect(getFirstParagraphFromHTML("<html><body><p>First paragraph</p><main><p>Main section paragraph</p></main></body></html>")).toBe("Main section paragraph");
});

test("if no main section p tag, then return first p tag", () => {
    expect(getFirstParagraphFromHTML("<html><body><p>First paragraph</p><main><h1>Main section heading</h1></main></body></html>")).toBe("First paragraph");
});

test("make sure all URLs are returned from html", () => {
    const html = `
        <html>
            <body>
                <a href="https://www.boot.dev">Boot.dev</a>
                <a href="/about">About</a>
                <a href="https://crawler-test.com">Example</a>
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedURLs = ["https://www.boot.dev", "https://www.boot.dev/about", "https://crawler-test.com"];
    expect(getURLsFromHTML(html, baseURL)).toEqual(expectedURLs);
});

test("handles relative URLs correctly", () => {
    const html = `
        <html>
            <body>
                <a href="/contact">Contact</a>
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedURLs = ["https://www.boot.dev/contact"];
    expect(getURLsFromHTML(html, baseURL)).toEqual(expectedURLs);
});

test("handles absolute URLs correctly", () => {
    const html = `
        <html>
            <body>
                <a href="https://crawler-test.com">Example</a>
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedURLs = ["https://crawler-test.com"];
    expect(getURLsFromHTML(html, baseURL)).toEqual(expectedURLs);
});

test("handles URLs with fragments correctly", () => {
    const html = `
        <html>
            <body>
                <a href="https://www.boot.dev#section">Boot.dev Section</a>
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedURLs = ["https://www.boot.dev#section"];
    expect(getURLsFromHTML(html, baseURL)).toEqual(expectedURLs);
});

test("handles URLs with query strings correctly", () => {
    const html = `
        <html>
            <body>
                <a href="https://www.boot.dev/search?q=crawler">Boot.dev Search</a>
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedURLs = ["https://www.boot.dev/search?q=crawler"];
    expect(getURLsFromHTML(html, baseURL)).toEqual(expectedURLs);
});

test("getImagesFromHTML returns all image URLs from html", () => {
    const html = `
        <html>
            <body>
                <img src="https://www.boot.dev/image1.jpg" />
                <img src="/image2.jpg" />
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedImageURLs = ["https://www.boot.dev/image1.jpg", "https://www.boot.dev/image2.jpg"];
    expect(getImagesFromHTML(html, baseURL)).toEqual(expectedImageURLs);
});

test("handles relative image URLs correctly", () => {
    const html = `
        <html>
            <body>
                <img src="/image.jpg" />
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedImageURLs = ["https://www.boot.dev/image.jpg"];
    expect(getImagesFromHTML(html, baseURL)).toEqual(expectedImageURLs);
});

test("handles absolute image URLs correctly", () => {
    const html = `
        <html>
            <body>
                <img src="https://www.boot.dev/image.jpg" />
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedImageURLs = ["https://www.boot.dev/image.jpg"];
    expect(getImagesFromHTML(html, baseURL)).toEqual(expectedImageURLs);
});

test("handles image URLs with query strings correctly", () => {
    const html = `
        <html>
            <body>
                <img src="https://www.boot.dev/image.jpg?size=large" />
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedImageURLs = ["https://www.boot.dev/image.jpg?size=large"];
    expect(getImagesFromHTML(html, baseURL)).toEqual(expectedImageURLs);
});

test("handles image URLs with fragments correctly", () => {
    const html = `
        <html>
            <body>
                <img src="https://www.boot.dev/image.jpg#section" />
            </body>
        </html>
    `;
    const baseURL = "https://www.boot.dev";
    const expectedImageURLs = ["https://www.boot.dev/image.jpg#section"];
    expect(getImagesFromHTML(html, baseURL)).toEqual(expectedImageURLs);
});

test("extractPageData returns correct data from html", () => {
    const html = `
        <html>
            <body>
                <h1>Test Heading</h1>
                <p>Test paragraph</p>
                <a href="https://www.boot.dev">Boot.dev</a>
                <img src="https://www.boot.dev/image.jpg" />
            </body>
        </html>
    `;
    const pageURL = "https://www.boot.dev";
    const expectedData = {
        title: "Test Heading",
        description: "Test paragraph",
        urls: ["https://www.boot.dev"],
        imageUrls: ["https://www.boot.dev/image.jpg"]
    };
    expect(extractPageData(html, pageURL)).toEqual(expectedData);
});

test("extractPageData handles missing data correctly", () => {
    const html = `
        <html>
            <body>
                <h1>Test Heading</h1>
            </body>
        </html>
    `;
    const pageURL = "https://www.boot.dev";
    const expectedData = {
        title: "Test Heading",
        description: "",
        urls: [],
        imageUrls: []
    };
    expect(extractPageData(html, pageURL)).toEqual(expectedData);
});

test("extractPageData handles multiple data points correctly", () => {
    const html = `
        <html>
            <body>
                <h1>Test Heading</h1>
                <p>Test paragraph</p>
                <a href="https://www.boot.dev">Boot.dev</a>
                <a href="https://www.example.com">Example</a>
                <img src="https://www.boot.dev/image.jpg" />
                <img src="https://www.example.com/image.jpg" />
            </body>
        </html>
    `;
    const pageURL = "https://www.boot.dev";
    const expectedData = {
        title: "Test Heading",
        description: "Test paragraph",
        urls: ["https://www.boot.dev", "https://www.example.com"],
        imageUrls: ["https://www.boot.dev/image.jpg", "https://www.example.com/image.jpg"]
    };
    expect(extractPageData(html, pageURL)).toEqual(expectedData);
});