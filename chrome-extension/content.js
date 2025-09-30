// Grab a likely job description container
function extractJob() {
    let desc = null;
    let selectorUsed = "none";
    
    // LinkedIn selectors
    if (location.hostname.includes("linkedin.com")) {
      desc = document.querySelector(".jobs-description__content") ||
             document.querySelector(".job-details-jobs-unified-top-card__container") ||
             document.querySelector(".jobs-box__html-content") ||
             document.querySelector("[data-module-id='job-details']");
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
      desc = document.querySelector(".description") || document.body;
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
  
  // Listen for popup requests
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getJobContent") {
      sendResponse(extractJob());
    }
  });  