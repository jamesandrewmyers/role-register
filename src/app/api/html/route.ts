import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Example: proxy HTML from a remote site
export async function GET() {
  const url = "https://www.linkedin.com/jobs/view/4299653238/?trackingId=&refId=&midToken=AQGpr2NrYFK3tg&midSig=3pxwxhgDJI4HY1&trk=eml-email_jobs_saved_job_reminder_01-saved~jobs-0-jobcard_body&trkEmail=eml-email_jobs_saved_job_reminder_01-saved~jobs-0-jobcard_body-null-swwka~mflf3sec~sa-null-null&eid=swwka-mflf3sec-sa&otpToken=MTYwZDFiZTYxNjJhY2RjNmJlMmYwMmVmNDExN2UyYmM4YWNmZDg0NjllYWQ4NTZmNzJjZjAzNjc0NzViNWJmYWZjYjM5NDg2NjVmOWNmZmE0NzQ0OGExNTlhMTJiMjI2MThiMzJkN2FkMGExMzc4OWE3LDEsMQ%3D%3D"; // remote HTML source

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return new NextResponse("Failed to load HTML", { status: 500 });
  }

  const html = await res.text();
  const cheerioHtml = cheerio.load(html);
  cheerioHtml("a").each((index, element) => {
    cheerioHtml(element).attr("onclick", "event.preventDefault(); event.stopPropagation(); console.log('Clicked:', this.text); return false;");
  });
  cheerioHtml("div").each((index, element) => {
    cheerioHtml(element).attr("onclick", "event.preventDefault(); event.stopPropagation(); console.log('Clicked: div'); return false;");
  });
  cheerioHtml("span").each((index, element) => {
    cheerioHtml(element).attr("onclick", "event.preventDefault(); event.stopPropagation(); console.log('Clicked: span'); return false;");
  });
  cheerioHtml("button").each((index, element) => {
    cheerioHtml(element).attr("onclick", "event.preventDefault(); event.stopPropagation(); console.log('Clicked: button'); return false;");
  });

  const newHtml = cheerioHtml.html();
  return new NextResponse(newHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}