import * as cheerio from "cheerio";

export interface GmailEmailData {
  subject: string;
  from: string;
  to: string;
  emailBody: string;
}

export function parseGmailEmail($: cheerio.CheerioAPI): GmailEmailData {
  // Extract subject from meta tags or headers
  const subject = $('meta[property="og:title"]').attr("content") ||
                  $('[data-subject]').attr("data-subject") ||
                  $('h2.hP').text().trim() ||
                  "Untitled Email";

  // Extract sender information
  const from = $('[data-email]').first().attr("data-email") ||
               $('span[email]').first().text().trim() ||
               "Unknown Sender";

  // Extract recipient information
  const to = $('[aria-label*="to"]').first().text().trim() ||
             $('[role="listitem"] span').text().trim() ||
             "Unknown Recipient";

  // Extract email body
  // Gmail email body is typically in a div with role="presentation" or class "a3s"
  const emailBodyElement = $('div[role="presentation"]:first').length > 0
    ? $('div[role="presentation"]:first')
    : $('[data-message-id] .a3s.aiL').length > 0
    ? $('[data-message-id] .a3s.aiL')
    : $('body');

  // Clean up the email body by removing attributes
  emailBodyElement.find('*').removeAttr('class').removeAttr('style').removeAttr('id').removeAttr('data-*');

  // Preserve some formatting for readability
  emailBodyElement.find('ul').each((_, el) => {
    $(el).css({ 'list-style-type': 'disc', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });

  emailBodyElement.find('ol').each((_, el) => {
    $(el).css({ 'list-style-type': 'decimal', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });

  emailBodyElement.find('li').each((_, el) => {
    $(el).css({ 'margin-bottom': '0.5rem' });
  });

  emailBodyElement.find('p').each((_, el) => {
    $(el).css({ 'margin-bottom': '1rem' });
  });

  emailBodyElement.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
    $(el).css({ 'font-weight': 'bold', 'margin-top': '1.5rem', 'margin-bottom': '0.75rem' });
  });

  emailBodyElement.find('strong, b').each((_, el) => {
    $(el).css({ 'font-weight': 'bold' });
  });

  const emailBody = emailBodyElement.html()?.trim() || "";

  return {
    subject,
    from,
    to,
    emailBody,
  };
}
