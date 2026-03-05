const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { html } = req.body || {};

  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "HTML content is required" });
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 850, height: 1200 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });

    const page = await browser.newPage();

    // Emulate screen media BEFORE setting content so CSS @media print rules are ignored
    await page.emulateMediaType("screen");

    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 15000,
    });

    // Wait for Google Fonts to load
    await page.evaluateHandle("document.fonts.ready");

    // A4 at 96dpi = 794px wide; our content is 850px → scale to fit
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 0.935,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res
      .status(500)
      .json({ error: "PDF generation failed: " + err.message });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
};
