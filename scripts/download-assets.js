const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://revid.ai';

// List of assets to download
const assets = [
  // Avatars
  { url: '/avatars/hustle_faceless.jpeg', dest: 'public/avatars/hustle_faceless.jpeg' },
  { url: '/avatars/tibo.jpg', dest: 'public/avatars/tibo.jpg' },
  { url: '/avatars/angrytom.jpeg', dest: 'public/avatars/angrytom.jpeg' },
  { url: '/avatars/jared.jpeg', dest: 'public/avatars/jared.jpeg' },
  { url: '/avatars/arian.jpeg', dest: 'public/avatars/arian.jpeg' },
  { url: '/avatars/marc.jpeg', dest: 'public/avatars/marc.jpeg' },
  
  // Images
  { url: '/images/ai-script-generator.webp', dest: 'public/images/ai-script-generator.webp' },
  { url: '/images/unique-voices.webp', dest: 'public/images/unique-voices.webp' },
  { url: '/images/video-styles.webp', dest: 'public/images/video-styles.webp' },
  { url: '/images/super-simple-editor.webp', dest: 'public/images/super-simple-editor.webp' },
  { url: '/images/high-quality.webp', dest: 'public/images/high-quality.webp' },
  { url: '/images/revid_logo_rec_light.png', dest: 'public/images/revid_logo_rec_light.png' },
  { url: '/images/get-inspired-by-viral-content.webp', dest: 'public/images/get-inspired-by-viral-content.webp' },
  { url: '/images/generate-your-script.webp', dest: 'public/images/generate-your-script.webp' },
  { url: '/images/create-your-viral-video.webp', dest: 'public/images/create-your-viral-video.webp' },
  { url: '/images/publish-on-tiktok.webp', dest: 'public/images/publish-on-tiktok.webp' },
  
  // SVG files
  { url: '/images/purple-right-neon-line.svg', dest: 'public/images/purple-right-neon-line.svg' },
  { url: '/images/green-left-neon-line.svg', dest: 'public/images/green-left-neon-line.svg' },
  { url: '/images/blue-left-neon-line.svg', dest: 'public/images/blue-left-neon-line.svg' },
  { url: '/images/blue-right-neon-line.svg', dest: 'public/images/blue-right-neon-line.svg' },
  { url: '/images/green-right-neon-line.svg', dest: 'public/images/green-right-neon-line.svg' },
];

// Function to download a file
function downloadFile(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
    };
    
    const req = protocol.get(url, options, (response) => {
      // Handle redirects (301, 302, 307, 308)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        return downloadFile(redirectUrl, dest, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      reject(err);
    });

    req.end();
  });
}

// Main function
async function downloadAllAssets() {
  console.log('Starting download of assets from revid.ai...\n');
  
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (const asset of assets) {
    const fullUrl = `${BASE_URL}${asset.url}`;
    try {
      console.log(`Downloading: ${asset.url}`);
      await downloadFile(fullUrl, asset.dest);
      console.log(`✓ Successfully downloaded: ${asset.dest}\n`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to download ${asset.url}: ${error.message}\n`);
      failCount++;
      failed.push({ url: asset.url, error: error.message });
    }
  }

  console.log('\n=== Download Summary ===');
  console.log(`Successfully downloaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failed.length > 0) {
    console.log('\nFailed downloads:');
    failed.forEach(({ url, error }) => {
      console.log(`  - ${url}: ${error}`);
    });
  }
}

// Run the script
downloadAllAssets().catch(console.error);

