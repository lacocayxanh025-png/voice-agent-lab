const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const blockedPatterns = [
  /(?:API_KEY|TOKEN|SECRET)[ \t]*=[ \t]*[A-Za-z0-9_-]{8,}/i,
  /sk-[A-Za-z0-9_-]{12,}/,
  /1[3-9]\d{9}/,
  /(?:^|[^0-9])\d{3,4}-\d{7,8}(?:[^0-9]|$)/,
  /127\.0\.0\.1:\d{2,5}/,
  /localhost:\d{2,5}/i,
  /\b(?:8787|8791)\b/,
  /dashscope/i,
  /qwen/i,
  /aliyun|alibaba/i,
  /Cherry|Ethan|Serena|Maia/i,
  /foxconsultant/i,
  /外呼|临时文件|复刻音色/,
  /file_url/i,
  /real_outbound/i,
  /recordings[\\/].+\.(wav|mp3|m4a)$/i
];

const ignoredDirs = new Set([".git", "node_modules"]);
const ignoredFiles = new Set(["package-lock.json", "check_no_sensitive_terms.js"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (!ignoredFiles.has(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

let failed = false;
for (const filePath of walk(root)) {
  const relative = path.relative(root, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  for (const pattern of blockedPatterns) {
    if (pattern.test(content) || pattern.test(relative)) {
      console.error(`Sensitive pattern matched in ${relative}: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Privacy check passed.");
