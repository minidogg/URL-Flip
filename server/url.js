// Built-In Imports
import path from 'path';
import fs from 'fs';

export let urlMap = new Map();
let urlJsonPath = path.resolve("./url.json");
if (fs.existsSync(urlJsonPath)) LoadURLs();

let recentlyCreatedLinks = [];
export let recentlyCreatedLinksHTML = "";

function LoadURLs() {
  let obj = JSON.parse(fs.readFileSync(urlJsonPath, "utf-8"));
  urlMap = new Map(Object.entries(obj));
}
function SaveURLs() {
  let obj = Object.fromEntries(urlMap);
  fs.writeFileSync(urlJsonPath, JSON.stringify(obj), "utf-8");

  recentlyCreatedLinks = recentlyCreatedLinks.slice(0, 10);
  recentlyCreatedLinksHTML = recentlyCreatedLinks
    .map((e) => `<a href="/${e}">/${e}</a>`)
    .join("");
}
setInterval(SaveURLs, 10 * 1000);
SaveURLs();

export function ValidateLink(link) {
    if (link.length > 300) return false;
    return /(https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?/.test(link);
}