import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import fetch from 'node-fetch';
import findConfig from 'find-config';

dotenv.config({ path: findConfig('.env.local') as string });

const API_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

// !!! IMPORTANT !!!
// Replace this with the actual user ID you want to associate the data with.
const USER_ID = 'YOUR_USER_ID';

if (USER_ID === 'YOUR_USER_ID') {
    throw new Error('Please replace YOUR_USER_ID with an actual user ID.');
}

const dataDir = path.join(__dirname, '../../data');

async function uploadData() {
  try {
    const files = fs.readdirSync(dataDir);

    for (const file of files) {
      const endpoint = path.parse(file).name;
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
      const items = data.items || [data]; // Handle both formats

      for (const item of items) {
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': USER_ID,
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to upload item to ${endpoint}:`, errorData);
        } else {
          console.log(`Uploaded item to ${endpoint}:`, item.title || item.name);
        }
      }
    }
    console.log('All data uploaded successfully.');
  } catch (error) {
    console.error('Error uploading data:', error);
  }
}

uploadData();
