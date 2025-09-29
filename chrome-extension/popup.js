document.getElementById("send").addEventListener("click", () => {
    // Ask content script for job content
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getJobContent" }, job => {
        if (!job) return alert("No job content found!");
  
        // Send to local server
        fetch("http://localhost:3000/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job)
        })
          .then(r => r.ok ? alert("Sent!") : alert("Failed"))
          .catch(err => alert("Error: " + err));
      });
    });
  });  