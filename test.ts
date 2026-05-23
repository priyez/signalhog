// test.ts
import { SignalHog } from "@signalhog/node";

async function main() {
  // 1. Initialize against your local API (port 3001)
  const client = new SignalHog({
    apiKey: "sk_ei5z6nx6zko", // Get a SECRET key from your local DB/Dashboard
    baseUrl: "http://localhost:3001"
  });

  await client.waitForInitialization();

  // 2. Test Flag Evaluation
  // The context needs to have a userId or distinctId, or we can use identify()
  client.identify("user_123456");
  const isEnabled = await client.isFeatureEnabled("safepoint", { userId: "user_123456" });
  console.log(`Flag is enabled: ${isEnabled}`);

  // 3. Test Event Capture (Funnel Simulation)
  console.log("Simulating Funnel Flow...");

  // Generate a random user ID for each run to populate the funnel with unique users
  const testUserId = `user_${Math.floor(Math.random() * 100000)}`;
  client.identify(testUserId);

  await client.capture("landing_page", { source: "local_test_script" });
  console.log(`[${testUserId}] Captured 'landing_page'`);
  
  await new Promise(r => setTimeout(r, 500));
  
  // 80% of users start signup
  if (Math.random() < 0.8) {
    await client.capture("signup_started", { source: "local_test_script" });
    console.log(`[${testUserId}] Captured 'signup_started'`);

    await new Promise(r => setTimeout(r, 500));

    // 50% of users complete signup
    if (Math.random() < 0.5) {
      await client.capture("signup_completed", { source: "local_test_script" });
      console.log(`[${testUserId}] Captured 'signup_completed'`);
    } else {
      console.log(`[${testUserId}] Dropped off before completing signup`);
    }
  } else {
    console.log(`[${testUserId}] Dropped off before starting signup`);
  }

  // 4. Test Historical Retention Data
  console.log("Simulating 14 Days of Retention Data...");
  const retentionUsers = 20;

  for (let i = 0; i < retentionUsers; i++) {
    const userId = `retention_user_${Math.floor(Math.random() * 100000)}`;
    const cohortOffsetDays = Math.floor(Math.random() * 14); // Joined between 0 and 14 days ago
    
    // 1. Initial event (Cohort Date)
    const cohortDate = new Date();
    cohortDate.setDate(cohortDate.getDate() - cohortOffsetDays);

    await fetch("http://localhost:3001/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer sk_ei5z6nx6zko` },
      body: JSON.stringify({
        event: "app_opened",
        distinctId: userId,
        timestamp: cohortDate.toISOString()
      })
    });

    // 2. Returning activity
    for (let day = 1; day <= cohortOffsetDays; day++) {
      // Exponential decay: higher chance to return early, drops off later
      const returnProbability = Math.max(0.1, 0.8 - (day * 0.05));
      
      if (Math.random() < returnProbability) {
        const activityDate = new Date(cohortDate);
        activityDate.setDate(activityDate.getDate() + day);

        await fetch("http://localhost:3001/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer sk_ei5z6nx6zko` },
          body: JSON.stringify({
            event: "app_opened",
            distinctId: userId,
            timestamp: activityDate.toISOString()
          })
        });
      }
    }
  }
  console.log("Finished simulating retention data!");

  // Clean up polling
  client.stop();
}
main();
