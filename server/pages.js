// Built-In Imports
import path from "path";
import fs from "fs";

// We don't need frameworks or templating engines where we are going.
export const pages = {
  index: "",
  error: "",
  share: "",
  redirect: "",
  advertise: "",
};

function UpdateDyanmicPages() {
  let navHTML = fs.readFileSync(
    path.resolve("./static/components/nav.html"),
    "utf-8"
  );
  pages.index = fs
    .readFileSync(path.resolve("./pages/index.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("LAST_LINKS");

  pages.error = fs
    .readFileSync(path.resolve("./pages/error.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("[Error-Code]");

  pages.share = fs
    .readFileSync(path.resolve("./pages/share.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("SHARE_LINK");

  pages.redirect = fs
    .readFileSync(path.resolve("./pages/redirect.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("REDIRECT_LINK");

  pages.advertise = fs
    .readFileSync(path.resolve("./pages/advertise.html"), "utf-8")
    .replace("<nav />", navHTML)
    .split("LAST_LINKS");
}

// Update the pages for first time
UpdateDyanmicPages();

// Watch for page updates
let havePagesUpdated = false;
fs.watch("./pages", { recursive: true }, (eventName, fileName) => {
  console.log("Page updated: " + fileName);
  havePagesUpdated = true;
});

// Update the pages every second
setInterval(() => {
  if (havePagesUpdated == true) {
    havePagesUpdated = false;
    UpdateDyanmicPages();
    console.log("Updated pages");
  }
}, 1000);
