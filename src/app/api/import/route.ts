import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/db";
import { dataReceived } from "@/lib/schema";
import { enqueueEvent } from "@/lib/event";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const job = await request.json();
    const { url, title, html, text } = job;

    // Validate required fields
    if (!url || !title || !html || !text) {
      return new Response("Missing required fields: url, title, html, text", { status: 400 });
    }

    // Log the length of received data
    console.log("Received data lengths:", {
      url: url.length,
      title: title.length,
      html: html.length,
      text: text.length
    });

    // Insert into data_received table
    const recordId = randomUUID();
    await db.insert(dataReceived).values({
      id: recordId,
      url,
      title,
      html,
      text,
      processed: "false"
    });

    // Create event to trigger background processing
    const event = await enqueueEvent("processHtml", {
      dataReceivedId: recordId,
      url,
      title
    });

    return new Response(JSON.stringify({ 
      success: true, 
      id: recordId,
      eventId: event.id 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error inserting data:", error);
    return new Response("Internal server error", { status: 500 });
  }
}