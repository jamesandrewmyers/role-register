const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Set DATABASE_PATH environment variable for fake database
process.env.DATABASE_PATH = 'data/fake_role_register.sqlite';

const screenshotsDir = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

let mainWindow;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(filename) {
  const image = await mainWindow.webContents.capturePage();
  const buffer = image.toPNG();
  const filepath = path.join(screenshotsDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Captured: ${filename}`);
}

async function captureScreenshots() {
  try {
    // Wait for page to fully load
    await delay(3000);
    
    // 1. Capture main search view
    console.log('📸 Capturing main search view...');
    await captureScreenshot('01-main-search.png');
    await delay(1000);
    
    // 2. Click on first role listing to open full screen view
    console.log('📸 Opening role listing details...');
    const clicked = await mainWindow.webContents.executeJavaScript(`
      // Find the first listing item with cursor-pointer class
      const listingItems = document.querySelectorAll('.cursor-pointer.rounded-lg');
      if (listingItems.length > 0) {
        listingItems[0].click();
        true;
      } else {
        false;
      }
    `);
    
    if (!clicked) {
      console.error('❌ Could not find listing item to click');
    }
    
    await delay(2500);
    await captureScreenshot('02-role-listing-details.png');
    await delay(500);
    
    // 3. Close role listing details by clicking back button
    console.log('📸 Returning to search...');
    await mainWindow.webContents.executeJavaScript(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const backButton = buttons.find(b => b.textContent.includes('Back to Listings'));
      if (backButton) {
        backButton.click();
      }
    `);
    await delay(1500);
    
    // 4. Open admin dialog
    console.log('📸 Opening admin dialog...');
    await mainWindow.webContents.executeJavaScript(`
      const adminButton = document.querySelector('button[aria-label="Admin settings"]');
      if (adminButton) {
        adminButton.click();
      }
    `);
    await delay(1500);
    
    // 5. Capture Settings tab (default)
    console.log('📸 Capturing Settings tab...');
    await captureScreenshot('03-admin-settings.png');
    await delay(500);
    
    // 6. Switch to Actions tab and capture
    console.log('📸 Capturing Actions tab...');
    await mainWindow.webContents.executeJavaScript(`
      const actionsTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Actions');
      if (actionsTab) {
        actionsTab.click();
      }
    `);
    await delay(1500);
    await captureScreenshot('04-admin-actions.png');
    await delay(500);
    
    // 7. Switch to Database tab and capture
    console.log('📸 Capturing Database tab...');
    await mainWindow.webContents.executeJavaScript(`
      const dbTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Database');
      if (dbTab) {
        dbTab.click();
      }
    `);
    await delay(1500);
    await captureScreenshot('05-admin-database.png');
    await delay(500);
    
    // 8. Switch to Monitoring tab and capture
    console.log('📸 Capturing Monitoring tab...');
    await mainWindow.webContents.executeJavaScript(`
      const monitoringTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Monitoring');
      if (monitoringTab) {
        monitoringTab.click();
      }
    `);
    await delay(1500);
    await captureScreenshot('06-admin-monitoring.png');
    
    console.log('\n✨ All screenshots captured successfully!');
    app.quit();
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    app.quit();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    captureScreenshots();
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
