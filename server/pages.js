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

let navHTML = ""
function getPageHTML(filePath, splitText){
  return fs
  .readFileSync(path.resolve(filePath), "utf-8")
  .replace("<nav />", navHTML)
  .split(splitText)
}
function UpdateDyanmicPages() {
  navHTML = fs.readFileSync(
    path.resolve("./static/components/nav.html"),
    "utf-8"
  );

  pages.index = getPageHTML("./pages/index.html", "LAST_LINKS");

  pages.error = getPageHTML("./pages/error.html", "[Error-Code]");

  pages.share = getPageHTML("./pages/share.html", "SHARE_LINK");

  pages.redirect = getPageHTML("./pages/redirect.html", "REDIRECT_LINK");

  pages.advertise = getPageHTML("./pages/advertise.html", "LAST_LINKS");
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
