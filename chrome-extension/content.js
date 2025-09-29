// Grab a likely job description container
function extractJob() {
    let desc =
      document.querySelector(".description") ||
      document.querySelector(".jobsearch-jobDescriptionText") ||
      document.querySelector(".job-details-jobs-unified-top-card__job-title") ||
      document.body;
      console.log("Desc:", desc);
  
    return {
      url: location.href,
      title: document.title,
      html: desc.innerHTML,
      text: desc.innerText
    };
  }
  
  // Listen for popup requests
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getJobContent") {
      sendResponse(extractJob());
    }
  });  