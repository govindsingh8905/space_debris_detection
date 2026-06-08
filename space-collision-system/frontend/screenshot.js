const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.new_page();
  await page.setViewportSize({ width: 1470, height: 801 });
  
  console.log("Navigating to page...");
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  
  console.log("Waiting for loader...");
  await page.waitForTimeout(6000);
  
  const screenshotPath = '/Users/govindsingh/Desktop/ai_debris_frontend /space-collision-system/frontend/public/homepage_test.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to ${screenshotPath}`);
  
  const canvases = await page.$$eval('canvas', canvases => canvases.length);
  console.log(`Number of canvases found: ${canvases}`);
  
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
