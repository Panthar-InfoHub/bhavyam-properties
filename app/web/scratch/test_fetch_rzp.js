const fs = require('fs');

// Parse .env.local manually
const envPath = 'c:/PantharInfoHub2nd/bhavyam-properties/app/web/.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2 && !parts[0].startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const key_id = env.RAZORPAY_KEY_ID;
const key_secret = env.RAZORPAY_KEY_SECRET;

async function checkRazorpay() {
  const authHeader = 'Basic ' + Buffer.from(key_id + ':' + key_secret).toString('base64');
  console.log("Auth Header:", authHeader);

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 9900,
        currency: 'INR',
        receipt: 'rcpt_test_123'
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkRazorpay();
