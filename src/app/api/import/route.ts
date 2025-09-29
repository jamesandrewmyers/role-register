import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Example: proxy HTML from a remote site
export async function POST(request: Request) {
    const job = await request.json();
    const url = job.url;
    const title = job.title;
    const html = job.html;
    const text = job.text;

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
  return new Response("Success", { status: 200 });

}