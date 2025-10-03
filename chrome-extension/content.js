// Grab a likely job description container
function extractJob() {
    let desc = null;
    let selectorUsed = "none";
    
    // LinkedIn selectors
    if (location.hostname.includes("linkedin.com")) {
      desc = document.querySelector('[class="job-view-layout jobs-details"]') ||
             document.querySelector('[class="jobs-details"]');
      selectorUsed = "linkedin";
    }
    
    // Indeed selectors  
    if (location.hostname.includes("indeed.com")) {
      desc = document.querySelector(".jobsearch-jobDescriptionText") ||
             document.querySelector("#jobDescriptionText") ||
             document.querySelector(".jobsearch-JobComponent-description");
      selectorUsed = "indeed";
    }
    
    // Fallback
    if (!desc) {
      console.warn("No known job description selector matched, using fallback.");
      //desc = document.querySelector(".description") || document.body;
      selectorUsed = "fallback";
    }
    
    console.log("Selector used:", selectorUsed);
    console.log("Element found:", desc);
    console.log("HTML length:", desc?.innerHTML?.length || 0);
    console.log("Text length:", desc?.innerText?.length || 0);
  
    return {
      url: location.href,
      title: document.title,
      html: desc?.innerHTML || "",
      text: desc?.innerText || ""
    };
  }
  
  // Handle messages from background script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getJobContent") {
      sendResponse(extractJob());
    } else if (msg.action === "extractAndSend") {
      // Extract job data and send it back to background script
      const jobData = extractJob();
      
      if (!jobData.html || jobData.html.length < 10) {
        sendResponse({ success: false, error: "No job content found on this page" });
        return;
      }
      
      // Send job data back to background script for API call
      sendResponse({ success: true, jobData: jobData });
    }
  });  