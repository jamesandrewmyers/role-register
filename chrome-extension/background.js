// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Only process on LinkedIn, Indeed, or Gmail
  if (tab.url.includes("linkedin.com/jobs") || tab.url.includes("indeed.com") || tab.url.includes("mail.google.com")) {
    // Send message to content script to extract job/email data
    chrome.tabs.sendMessage(tab.id, { action: "extractAndSend" }, (response) => {
      console.log("Response from content script:", response);
      if (chrome.runtime.lastError) {
        console.log("Error:", chrome.runtime.lastError);
        showNotification("Capture Error", "Failed to capture data. Make sure you're on a supported page.");
      } else if (response && response.success && response.jobData) {
        // Now send the data to the API from background script
        sendDataToAPI(response.jobData);
      } else {
        showNotification("Capture Failed", response?.error || "Failed to extract data from page.");
      }
    });
  } else {
    showNotification("Capture", "Please navigate to a LinkedIn job posting, Indeed job, or Gmail email to capture data.");
  }
});

// Function to send data (job/email) to API
async function sendDataToAPI(jobData) {
  try {
    const response = await fetch("http://localhost:3000/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Data Captured!", "Content has been sent to your app successfully.");
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending data:", error);
    showNotification("Capture Failed", `Failed to send data to app: ${error.message}`);
  }
}

// Helper function to show notifications
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon48.png",
    title: title,
    message: message
  });
}