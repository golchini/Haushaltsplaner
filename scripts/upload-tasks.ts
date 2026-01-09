import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import fetch from 'node-fetch'; // Import node-fetch for server-side fetch

const API_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'; // Adjust if needed

// !!! IMPORTANT !!!
// Replace this with the actual user ID you want to associate the data with.
const USER_ID = 'YOUR_USER_ID';

if (USER_ID === 'YOUR_USER_ID') {
    throw new Error('Please replace YOUR_USER_ID with an actual user ID.');
}

const dataFilePath = path.join(__dirname, '../../data/tasks.json');

async function uploadTasks() {
  try {
    const tasksData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    const tasksToUpload = tasksData.items;

    for (const task of tasksToUpload) {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID, // Custom header for user_id, as it's not part of the task data directly
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload task: ${JSON.stringify(errorData)}`);
      }
      console.log(`Uploaded task: ${task.title}`);
    }
    console.log('All tasks uploaded successfully.');
  } catch (error) {
    console.error('Error uploading tasks:', error);
  }
}

uploadTasks();
