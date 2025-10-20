// Grab a likely job description container
function extractJob() {
    let desc = null;
    let selectorUsed = "none";
    let jobUrl = location.href;
    
    // LinkedIn selectors
    if (location.hostname.includes("linkedin.com")) {
      desc = document.querySelector('[class="job-view-layout jobs-details"]') ||
             document.querySelector('[class="jobs-details"]');
      selectorUsed = "linkedin";
    }
    
    // Indeed selectors  
    if (location.hostname.includes("indeed.com")) {
      desc = document.querySelector("#job-full-details");
      selectorUsed = "indeed";
      
      // Indeed displays jobs in a right panel on search results
      // The selected job card has aria-pressed="true"
      const selectedJob = document.querySelector('[data-jk][aria-pressed="true"]');
      const jobKey = selectedJob?.getAttribute('data-jk');
      
      if (jobKey) {
        jobUrl = `https://www.indeed.com/viewjob?jk=${jobKey}`;
        console.log("Found Indeed job URL:", jobUrl);
      } else {
        console.warn("Could not find selected job with aria-pressed=true");
      }
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
      url: jobUrl,
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
    return true;
  });  