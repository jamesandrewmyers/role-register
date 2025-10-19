import * as cheerio from "cheerio";

export interface IndeedJobData {
  workArrangement: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobDescription: string;
}

export function parseIndeedJob($: cheerio.CheerioAPI): IndeedJobData {
  // Extract work arrangement from job details
  const jobDetailsText = $(".jobsearch-JobDescriptionSection-sectionItem").text().toLowerCase();
  
  const workArrangement = jobDetailsText.indexOf("remote") !== -1 ? "remote" :
    jobDetailsText.indexOf("hybrid") !== -1 ? "hybrid" :
    jobDetailsText.indexOf("on-site") !== -1 || jobDetailsText.indexOf("onsite") !== -1 ? "on-site" : "unspecified";

  // Extract job title
  const jobTitle = $("h1.jobsearch-JobInfoHeader-title").text().trim() || 
                   $(".jobsearch-JobInfoHeader-title span").text().trim() || "";

  // Extract company name
  const companyName = $("[data-company-name='true']").text().trim() ||
                      $(".jobsearch-InlineCompanyRating-companyHeader a").text().trim() ||
                      $(".jobsearch-JobInfoHeader-subtitle a").first().text().trim() || "";

  // Extract job location
  const jobLocation = $("[data-testid='job-location']").text().trim() ||
                      $(".jobsearch-JobInfoHeader-subtitle div").last().text().trim() || "";

  // Extract and format job description
  const jobDescriptionElement = $("#jobDescriptionText");
  
  // Remove all classes, styles, and ids
  jobDescriptionElement.find('*').removeAttr('class').removeAttr('style').removeAttr('id');
  
  // Style unordered lists
  jobDescriptionElement.find('ul').each((_, el) => {
    $(el).css({ 'list-style-type': 'disc', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });
  
  // Style ordered lists
  jobDescriptionElement.find('ol').each((_, el) => {
    $(el).css({ 'list-style-type': 'decimal', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });
  
  // Style list items
  jobDescriptionElement.find('li').each((_, el) => {
    $(el).css({ 'margin-bottom': '0.5rem' });
  });
  
  // Style paragraphs
  jobDescriptionElement.find('p').each((_, el) => {
    $(el).css({ 'margin-bottom': '1rem' });
  });
  
  // Style headings
  jobDescriptionElement.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
    $(el).css({ 'font-weight': 'bold', 'margin-top': '1.5rem', 'margin-bottom': '0.75rem' });
  });
  
  // Style strong/bold text
  jobDescriptionElement.find('strong, b').each((_, el) => {
    $(el).css({ 'font-weight': 'bold' });
  });
  
  const jobDescription = jobDescriptionElement.html()?.trim() || "";

  return {
    workArrangement,
    jobTitle,
    companyName,
    jobLocation,
    jobDescription,
  };
}
