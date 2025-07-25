const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to CDM Schema Viewer...');
  await page.goto('https://jplfaria.github.io/cdm_schema_viewer/', { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  // Wait for schema to load
  console.log('Waiting for schema to load...');
  await page.waitForTimeout(5000);
  
  // Create exports directory if it doesn't exist
  const exportsDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }
  
  // Capture full page screenshot
  console.log('Capturing screenshot...');
  await page.screenshot({ 
    path: path.join(exportsDir, 'cdm-schema-full.png'),
    fullPage: true 
  });
  
  // Try to click export buttons if they exist
  try {
    // Look for export buttons
    const exportButtons = await page.$$('button');
    console.log(`Found ${exportButtons.length} buttons`);
    
    // Log button texts
    for (const button of exportButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      console.log(`Button: ${text}`);
    }
  } catch (error) {
    console.log('Could not find export buttons:', error.message);
  }
  
  // Get page content for analysis
  const content = await page.content();
  fs.writeFileSync(path.join(exportsDir, 'page-content.html'), content);
  
  // Check for any errors
  const errors = await page.$$('.text-red-500');
  if (errors.length > 0) {
    console.log('Found error messages on page');
    for (const error of errors) {
      const errorText = await page.evaluate(el => el.textContent, error);
      console.log(`Error: ${errorText}`);
    }
  }
  
  await browser.close();
  console.log('Screenshot captured successfully!');
}

captureScreenshots().catch(console.error);