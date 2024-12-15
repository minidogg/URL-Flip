// Imports
import path from 'path';
import fs from 'fs';

import formidable from "express-formidable";
import express from "express";

// We don't need frameworks or templating engines where we are going.
const pages = {
  index: "",
  error: "",
  share: "",
  redirect: "",
};


function UpdateDyanmicPages() {
  let navHTML = fs.readFileSync(path.resolve("./static/nav.html"), "utf-8")
  pages.index = fs
    .readFileSync(path.resolve("./pages/index.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("LAST_LINKS");

  pages.error = fs
    .readFileSync(path.resolve("./pages/error.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("ERROR"); // We split it at ERROR so then we can do errorHTML.join(errorMsg)
  pages.share = fs
    .readFileSync(path.resolve("./pages/share.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("SHARE_LINK");
  pages.redirect = fs
    .readFileSync(path.resolve("./pages/redirect.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("REDIRECT_LINK");


}
UpdateDyanmicPages();
let havePagesUpdated = false;
fs.watch("./pages", { recursive: true }, (eventName, fileName) => {
  console.log("Page updated: " + fileName);
  havePagesUpdated = true;
});
setInterval(() => {
  if (havePagesUpdated == true) {
    havePagesUpdated = false;
    UpdateDyanmicPages();
    console.log("Updated pages");
  }
}, 1000);

const app = express();
const port = 3000;

let urlMap = new Map();
let urlJsonPath = path.resolve("./url.json");
if (fs.existsSync(urlJsonPath)) LoadURLs();

let recentlyCreatedLinks = [];
let recentlyCreatedLinksHTML = "";

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

const randomNum = (max = 100) => Math.floor(Math.random() * max);
app.use((req, res, next) => {
  if (req.path[1] != "q") {
    next();
    return;
  }
  let url = urlMap.get(req.path.replace("/", ""));
  if (!url) {
    res.status(404);
    res.send(
      pages.error.join(
        "The shorten URL you requested is invalid or no longer exists!"
      )
    );
    return;
  }
  let pickedUrl = url[randomNum(100) >= url[2] ? 1 : 0];

  res.set("Cache-Control", "max-age=60");
  res.send(pages.redirect.join(pickedUrl));
});

app.use(express.static("./static"));
app.get("/", (req, res) => {
  res.send(pages.index.join(recentlyCreatedLinksHTML));
});

function ValidateLink(link) {
  if (link.length > 300) return false;
  return /(https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?/.test(link);
}

const genRanString = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join("");
function ShortenLink(linkA, linkB, chance) {
  let code = undefined;
  while (code == undefined || urlMap.has(code)) {
    code = genRanString(8);
  }
  code = "q" + code;
  urlMap.set(code, [linkA, linkB, chance]);

  return code;
}

app.use(formidable());
app.post("/shorten", (req, res) => {
  if (!ValidateLink(req.fields.linkA) || !ValidateLink(req.fields.linkB)) {
    res.status(500);
    res.send(pages.error.join("An invalid link was provided!"));
    return;
  }
  if (req.fields.chance > 100 || req.fields.chance < 0) {
    res.status(500);
    res.send(pages.error.join("Invalid form body provided!"));
    return;
  }

  let shortenedLink = ShortenLink(
    req.fields.linkA,
    req.fields.linkB,
    Math.ceil(req.fields.chance)
  );
  if (shortenedLink == undefined) {
    res.status(500);
    res.send(
      pages.error.join("Something went wrong when shortening your URL!")
    );
    return;
  }
  recentlyCreatedLinks.unshift(shortenedLink);
  res.send(pages.share.join(shortenedLink));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
