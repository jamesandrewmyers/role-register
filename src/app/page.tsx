"use client";

import { useEffect, useRef } from "react";

export default function Page() {
  // This is the placeholder div where the shadow DOM will live
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    // Create shadow root (only once)
    const shadow = hostRef.current.attachShadow({ mode: "open" });

    async function loadRemoteHtml() {
      try {
        // Fetch remote HTML (could also be a local file under /public)
        const res = await fetch("/api/html");
        const html = await res.text();

        // Inject into the shadow root
        shadow.innerHTML = html;

        // OPTIONAL: attach event handlers to every element inside
        /*
        shadow.querySelectorAll("*").forEach((el) => {
          el.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Clicked:", (el as HTMLElement).outerHTML);
          });
        });
        */
      } catch (err) {
        console.error("Failed to load HTML:", err);
      }
    }

    loadRemoteHtml();
  }, []);

  return (
    <main className="p-6">
      <h1>Host Page</h1>
      <p>This is the normal React page.</p>

      {/* This is where the shadow DOM will be attached */}
      <div ref={hostRef} style={{ border: "2px dashed gray", padding: "1rem" }} />
    </main>
  );
}
