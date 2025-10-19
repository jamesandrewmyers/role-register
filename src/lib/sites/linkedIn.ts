import * as cheerio from "cheerio";

export interface LinkedInJobData {
  workArrangement: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobDescription: string;
}

export function parseLinkedInJob($: cheerio.CheerioAPI): LinkedInJobData {
  const jobFit = $(".job-details-fit-level-preferences").text().trim() || "";

  const workArrangement = jobFit.indexOf("On-site") !== -1 ? "on-site" :
    jobFit.indexOf("Hybrid") !== -1 ? "hybrid" :
    jobFit.indexOf("Remote") !== -1 ? "remote" : "unspecified";

    const jobTitle =
    $(".job-details-jobs-unified-top-card__job-title").text().trim() || "";

  const companyName =
    $(".job-details-jobs-unified-top-card__company-name").text().trim() || "";

  const jobLocation =
    $(".job-details-jobs-unified-top-card__tertiary-description-container span.tvm__text")
      .map((_, el) => $(el).text().trim())
      .get()
      .find(txt => txt.length > 0) || "";

  const jobDescriptionElement = $(".jobs-box__html-content");
  
  jobDescriptionElement.find('*').removeAttr('class').removeAttr('style').removeAttr('id');
  
  jobDescriptionElement.find('ul').each((_, el) => {
    $(el).css({ 'list-style-type': 'disc', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });
  
  jobDescriptionElement.find('ol').each((_, el) => {
    $(el).css({ 'list-style-type': 'decimal', 'margin-left': '1.5rem', 'margin-bottom': '1rem' });
  });
  
  jobDescriptionElement.find('li').each((_, el) => {
    $(el).css({ 'margin-bottom': '0.5rem' });
  });
  
  jobDescriptionElement.find('p').each((_, el) => {
    $(el).css({ 'margin-bottom': '1rem' });
  });
  
  jobDescriptionElement.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
    $(el).css({ 'font-weight': 'bold', 'margin-top': '1.5rem', 'margin-bottom': '0.75rem' });
  });
  
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
