const axios = require('axios');

const API_URL = 'http://localhost:3001';
const API_KEY = 'pk_test'; // I need to make sure this exists in the DB or use a real one

async function runTest() {
  console.log('Sending 100 events...');
  
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      axios.post(`${API_URL}/capture`, {
        event: 'test_event_batch',
        distinctId: `user_${i}`,
        properties: { index: i, batch: true },
      }, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      })
    );
  }

  try {
    await Promise.all(promises);
    console.log('Successfully sent 100 events.');
    console.log('Wait for 5 seconds to see the batch flush in worker logs...');
  } catch (err) {
    console.error('Failed to send events. Is the API running?', err.message);
  }
}

runTest();
