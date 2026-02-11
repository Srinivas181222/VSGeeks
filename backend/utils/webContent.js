const { URL } = require("url");

const ALLOWED_SOURCE_HOSTS = [
  "geeksforgeeks.org",
  "w3schools.com",
  "docs.python.org",
  "medium.com",
  "realpython.com",
];

const CURATED_SOURCES_BY_TOPIC = {
  "python-basics": [
    "https://www.w3schools.com/python/python_syntax.asp",
    "https://www.w3schools.com/python/python_strings.asp",
    "https://www.w3schools.com/python/python_user_input.asp",
  ],
  "variables-data-types": [
    "https://www.w3schools.com/python/python_variables.asp",
    "https://www.w3schools.com/python/python_lists.asp",
  ],
  "conditionals-loops": [
    "https://www.w3schools.com/python/python_conditions.asp",
    "https://www.w3schools.com/python/python_for_loops.asp",
  ],
  functions: [
    "https://www.w3schools.com/python/python_functions.asp",
    "https://www.geeksforgeeks.org/python/args-kwargs-python/",
  ],
  oop: [
    "https://www.w3schools.com/python/python_classes.asp",
    "https://www.geeksforgeeks.org/python/python-classes-and-objects/",
  ],
  "modules-packages": [
    "https://www.w3schools.com/python/python_modules.asp",
    "https://docs.python.org/3/tutorial/modules.html",
  ],
};

const decodeHtmlEntities = (value) => {
  if (!value) return "";
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, code) => {
    const normalized = String(code).toLowerCase();
    if (normalized === "nbsp") return " ";
    if (normalized === "amp") return "&";
    if (normalized === "lt") return "<";
    if (normalized === "gt") return ">";
    if (normalized === "quot") return '"';
    if (normalized === "apos") return "'";
    if (normalized.startsWith("#x")) {
      const parsed = Number.parseInt(normalized.slice(2), 16);
      return Number.isNaN(parsed) ? "" : String.fromCharCode(parsed);
    }
    if (normalized.startsWith("#")) {
      const parsed = Number.parseInt(normalized.slice(1), 10);
      return Number.isNaN(parsed) ? "" : String.fromCharCode(parsed);
    }
    return "";
  });
};

const normalizeWhitespace = (value) =>
  value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/section|\/article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

const pickTitle = (html, fallbackUrl) => {
  const ogTitle = html.match(
    /<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  if (ogTitle?.[1]) return normalizeWhitespace(decodeHtmlEntities(ogTitle[1]));

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleTag?.[1]) return normalizeWhitespace(decodeHtmlEntities(titleTag[1]));

  return fallbackUrl;
};

const looksLikeNoise = (line) => {
  if (line.length < 30) return true;
  const lower = line.toLowerCase();
  return [
    "cookie",
    "privacy policy",
    "terms of use",
    "accept all",
    "sign in",
    "log in",
    "newsletter",
    "advertisement",
    "sponsored",
    "read more",
    "follow us",
    "all rights reserved",
  ].some((token) => lower.includes(token));
};

const selectParagraphs = (plainText) => {
  const rawLines = plainText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seen = new Set();
  const paragraphs = [];
  for (const line of rawLines) {
    const key = line.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (looksLikeNoise(line)) continue;
    paragraphs.push(line);
  }
  return paragraphs;
};

const hostnameAllowed = (host) =>
  ALLOWED_SOURCE_HOSTS.some((allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`));

const parseAllowedUrl = (urlString) => {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Only http/https URLs are supported: ${urlString}`);
  }

  if (!hostnameAllowed(parsed.hostname.toLowerCase())) {
    throw new Error(`URL host is not in allowlist: ${parsed.hostname}`);
  }

  return parsed;
};

const fetchHtml = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "CodeLearnContentBot/1.0 (+https://vsgeeks-1.onrender.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html")) {
      throw new Error(`Unsupported content type: ${contentType || "unknown"}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const buildExcerpt = (paragraphs, maxChars = 2000) => {
  let output = "";
  for (const paragraph of paragraphs) {
    const next = output ? `${output}\n\n${paragraph}` : paragraph;
    if (next.length > maxChars) break;
    output = next;
    if (output.length >= 1200 && output.split("\n\n").length >= 5) break;
  }
  return output || paragraphs[0]?.slice(0, maxChars) || "";
};

const scrapeLessonContent = async ({ url, topicTitle, lessonTitle, maxChars = 2000 }) => {
  const parsed = parseAllowedUrl(url);
  const finalUrl = parsed.toString();
  const html = await fetchHtml(finalUrl);
  const sourceTitle = pickTitle(html, finalUrl);
  const text = normalizeWhitespace(decodeHtmlEntities(stripHtml(html)));
  const paragraphs = selectParagraphs(text);

  if (!paragraphs.length) {
    throw new Error("No readable paragraphs found in source");
  }

  const excerpt = buildExcerpt(paragraphs, maxChars);
  if (!excerpt) {
    throw new Error("Failed to build readable lesson excerpt");
  }

  const content = [
    `Learning notes for ${lessonTitle} (${topicTitle})`,
    "",
    excerpt,
    "",
    `Source: ${sourceTitle}`,
    `Read full article: ${finalUrl}`,
  ].join("\n");

  return {
    sourceTitle,
    sourceUrl: finalUrl,
    content,
  };
};

const pickCuratedSourceForLesson = (topicSlug, lessonIndex) => {
  const sources = CURATED_SOURCES_BY_TOPIC[topicSlug] || [];
  if (!sources.length) return null;
  return sources[lessonIndex % sources.length];
};

module.exports = {
  CURATED_SOURCES_BY_TOPIC,
  scrapeLessonContent,
  pickCuratedSourceForLesson,
};
