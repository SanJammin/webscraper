import { expect, test } from "vitest";
import { normalizeURL } from "./crawl";
import { getHeadingFromHTML } from "./crawl";

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