const fs = require("fs");
const docs = "C:/Users/simhc/Documents/Middle School Informatics Courseware/src/data/curriculum.ts";
const ms = "C:/Users/simhc/ms-courseware/src/data/curriculum.ts";

function hasKorean(s) {
  return s.includes("RAM") && s.includes("SSD") && /[가-힣]/.test(s);
}

const candidates = [docs, ms + ".bak", "C:/Users/simhc/ms-info-courseware/src/data/curriculum.ts"];
let restored = false;
for (const c of candidates) {
  if (!fs.existsSync(c)) continue;
  const s = fs.readFileSync(c, "utf8");
  console.log("check", c, "korean=", hasKorean(s), "len=", s.length);
  if (hasKorean(s) && !s.includes("},,")) {
    // prefer clean original without broken expand
    fs.writeFileSync(ms, s, "utf8");
    console.log("restored from", c);
    restored = true;
    break;
  }
  if (hasKorean(s)) {
    fs.writeFileSync(ms, s, "utf8");
    console.log("restored (with korean) from", c);
    restored = true;
    break;
  }
}

const now = fs.readFileSync(ms, "utf8");
console.log("final korean=", hasKorean(now));
