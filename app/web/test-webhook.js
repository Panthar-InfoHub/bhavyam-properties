// USAGE: node test-webhook.js <ORDER_ID>
const orderId = process.argv[2];

if (!orderId) {
  console.error("❌ Please provide a Razorpay Order ID as an argument.");
  console.log("Example: node test-webhook.js order_PqRstU12345");
  process.exit(1);
}

const mockPayload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: "pay_test_" + Math.random().toString(36).substring(7),
        order_id: orderId,
        amount: 50000,
        currency: "INR",
        status: "captured",
        method: "card",
      }
    }
  }
};

async function triggerWebhook() {
  console.log(`🚀 Triggering mock webhook for Order: ${orderId}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-bypass': 'true' // Custom header to bypass signature verification in DEV
      },
      body: JSON.stringify(mockPayload)
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Webhook Triggered Successfully!");
      console.log("Response:", data);
      console.log("\nNext Steps:");
      console.log("1. Check your Dashboard or Transactions table.");
      console.log("2. Your membership or property unlock should now be ACTIVE.");
    } else {
      console.error("❌ Webhook Failed:", data);
    }
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
    console.log("Make sure your Next.js server is running on http://localhost:3000");
  }
}

triggerWebhook();
