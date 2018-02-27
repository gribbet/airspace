import "mocha";

import * as express from "express";
import * as http from "http";
import * as puppeteer from "puppeteer";
import * as serveStatic from "serve-static";

import { delay } from "../source/scripts/common";

const port = 8080;
let server: http.Server | null = null;
let browser: puppeteer.Browser | null = null;
let page: puppeteer.Page | null = null;

before(async () => {

    const app = express();
    app.use(
        serveStatic("build", {
            "index": "index.html"
        }));
    server = app.listen(port);

    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    page.on("error", error =>
        console.log("Error", error));
    page.on("pageerror", error =>
        console.log("Page error", error));
});

after(async () => {
    if (browser !== null)
        browser.close();
    if (server !== null)
        server.close();
});

beforeEach(async () => {
    if (page === null)
        throw "";
    await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle2"
    });
})

describe("UI tests", () => {

    it("can draw a shape", async () => {
        if (page === null)
            throw "";
        const map = await page.waitForSelector(".map");

        const viewport = page.viewport();
        const width = viewport.width;
        const height = viewport.height;

        const mouse = page.mouse;
        mouse.click(width / 4, height / 4);
        await delay(25);
        mouse.move(width * 3 / 4, height / 4);
        await delay(25);
        mouse.move(width * 3 / 4, height * 3 / 4);
        await delay(25);
        mouse.move(width / 4, height * 3 / 4);
        await delay(25);
        mouse.move(width / 4, height / 4);
        await delay(25);
        mouse.click(width / 4, height / 4);

        await delay(4000);

        await page.screenshot({ path: "test.png" });
    });
});