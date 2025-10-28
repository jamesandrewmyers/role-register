// Grab a likely job description container or email content
function extractJob() {
    let desc = null;
    let selectorUsed = "none";
    let jobUrl = location.href;
    let title = document.title;

    // Gmail email selectors
    if (location.hostname.includes("mail.google.com")) {
      // Gmail stores email body in various containers depending on view
      // Try multiple selectors for different Gmail layouts
      desc = document.querySelector('[data-message-id] div[role="presentation"]') ||
             document.querySelector('.h7 div[role="presentation"]') ||
             document.querySelector('div[data-message-id] .a3s.aiL') ||
             document.querySelector('.gs.gE.iv.gt') ||
             document.body;

      // Extract email subject as title
      const subjectElement = document.querySelector('h2.hP') || document.querySelector('[data-subject]');
      if (subjectElement) {
        title = subjectElement.textContent.trim();
      }

      // Try to extract sender/recipient info
      const fromElement = document.querySelector('span[email]') || document.querySelector('[role="listitem"] span');
      const recipientInfo = fromElement ? fromElement.textContent : "";

      selectorUsed = "gmail";
      console.log("Gmail email detected. Subject:", title);
    }

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
      console.warn("No known content selector matched, using fallback.");
      //desc = document.querySelector(".description") || document.body;
      selectorUsed = "fallback";
    }

    console.log("Selector used:", selectorUsed);
    console.log("Element found:", desc);
    console.log("HTML length:", desc?.innerHTML?.length || 0);
    console.log("Text length:", desc?.innerText?.length || 0);

    return {
      url: jobUrl,
      title: title,
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