import { crawlSiteAsync } from "./crawl.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length > 3) {
        console.error("Too many arguments provided.");
        process.exit(1);
    } else if (args.length < 3) {
        console.error("Insufficient arguments provided.");
        process.exit(1);
    }

    const baseURL = args[0];
    const maxConcurrency = parseInt(args[1]);
    const maxPages = parseInt(args[2]);

    console.log(`Crawler is starting at base URL: ${baseURL}`);
    console.log(await crawlSiteAsync(baseURL, maxConcurrency, maxPages));
}

main();