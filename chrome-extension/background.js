// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Only process on LinkedIn or Indeed
  if (tab.url.includes("linkedin.com/jobs") || tab.url.includes("indeed.com")) {
    // Send message to content script to extract job data
    chrome.tabs.sendMessage(tab.id, { action: "extractAndSend" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        showNotification("Job Capture Error", "Failed to capture job data. Make sure you're on a job posting page.");
      } else if (response && response.success && response.jobData) {
        // Now send the job data to the API from background script
        sendJobDataToAPI(response.jobData);
      } else {
        showNotification("Job Capture Failed", response?.error || "Failed to extract job data from page.");
      }
    });
  } else {
    showNotification("Job Capture", "Please navigate to a LinkedIn or Indeed job posting to capture data.");
  }
});

// Function to send job data to API
async function sendJobDataToAPI(jobData) {
  try {
    const response = await fetch("http://localhost:3000/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData)
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification("Job Captured!", "Job posting has been sent to your app successfully.");
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending job data:", error);
    showNotification("Job Capture Failed", `Failed to send data to app: ${error.message}`);
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