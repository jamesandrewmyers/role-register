interface ExtractedRequirement {
  text: string;
  confidence: 'high' | 'medium' | 'low';
  category?: string;
  source: string;
  type: 'required' | 'nice-to-have';
}

interface ExtractionResult {
  requirements: ExtractedRequirement[];
  summary: string;
}

export function extractRequirements(jobDescription: string): ExtractionResult {
  const requirements: ExtractedRequirement[] = [];
  
  const sections = splitIntoSections(jobDescription);
  
  for (const section of sections) {
    const sectionRequirements = extractFromSection(section);
    requirements.push(...sectionRequirements);
  }
  
  const deduplicated = deduplicateRequirements(requirements);
  
  const sectionInfo = sections.map(s => 
    `"${s.header}" (${s.isRequirementSection ? 'REQ' : s.isNiceToHaveSection ? 'NICE' : 'OTHER'})`
  ).join(', ');
  
  return {
    requirements: deduplicated,
    summary: `Extracted ${deduplicated.length} requirements from job description. Sections: ${sectionInfo}`
  };
}

interface Section {
  header: string;
  content: string;
  isRequirementSection: boolean;
  isNiceToHaveSection: boolean;
}

function splitIntoSections(text: string): Section[] {
  const sections: Section[] = [];
  
  const lines = text.split(/\n/);
  let currentSection: Section | null = null;
  let inRequirementSection = false;
  let inNiceToHaveSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    const headerMatch = trimmed.match(/^([A-Z][A-Za-z\s&\/\-,'\u2019]+):?\s*$/);
    if (headerMatch && trimmed.length < 80) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const header = headerMatch[1].toLowerCase();
      const isReqHeader = isRequirementHeader(header);
      const isNiceHeader = isNiceToHaveHeader(header);
      
      if (isReqHeader) {
        inRequirementSection = true;
        inNiceToHaveSection = false;
      } else if (isNiceHeader) {
        inNiceToHaveSection = true;
        inRequirementSection = false;
      }
      
      currentSection = {
        header: headerMatch[1],
        content: '',
        isRequirementSection: inRequirementSection,
        isNiceToHaveSection: inNiceToHaveSection
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    } else {
      if (!currentSection) {
        currentSection = {
          header: 'Introduction',
          content: '',
          isRequirementSection: false,
          isNiceToHaveSection: false
        };
      }
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function isRequirementHeader(header: string): boolean {
  const requirementHeaders = [
    'requirements',
    'qualifications',
    'required qualifications',
    'minimum qualifications',
    'preferred qualifications',
    'must have',
    'required skills',
    'technical skills',
    'experience',
    'education',
    'skills',
    'knowledge',
    'abilities',
    'knowledge, skills, and abilities',
    'what you need',
    'what we need',
    'what you\'ll need',
    'what you\'ll bring',
    'what you\u2019ll bring',
    'what you bring',
    'what you should have',
    'you will need',
    'you\'ll bring',
    'you\u2019ll bring',
    'you\'ll need',
    'you\u2019ll need',
    'skills you\'ll need',
    'skills you need',
    'basic qualifications',
    'preferred skills',
    'required experience'
  ];
  
  return requirementHeaders.some(rh => header.toLowerCase().includes(rh));
}

function isNiceToHaveHeader(header: string): boolean {
  const niceToHaveHeaders = [
    'nice to have',
    'preferred',
    'bonus',
    'plusses',
    'plus',
    'desired',
    'preferred qualifications',
    'preferred skills',
    'optional',
    'a plus',
    'would be a plus',
    'nice-to-have'
  ];
  
  return niceToHaveHeaders.some(nth => header.toLowerCase().includes(nth));
}

function extractFromSection(section: Section): ExtractedRequirement[] {
  const requirements: ExtractedRequirement[] = [];
  
  let lines = section.content.split(/\n/).filter(l => l.trim().length > 0);
  
  const expandedLines: Array<{text: string, wasBullet: boolean}> = [];
  for (const line of lines) {
    if (line.includes('•') && line.trim().split('•').length > 2) {
      const bullets = line.split('•').map(s => s.trim()).filter(s => s.length > 0);
      bullets.forEach(b => expandedLines.push({text: b, wasBullet: true}));
    } else if (line.match(/\s+[-*]\s+.*\s+[-*]\s+/)) {
      const bullets = line.split(/\s+[-*]\s+/).map(s => s.trim()).filter(s => s.length > 0);
      bullets.forEach(b => expandedLines.push({text: b, wasBullet: true}));
    } else {
      const isBullet = /^[•\•\-\*\+\u2022]|\d+[\.)]\s/.test(line.trim());
      expandedLines.push({text: line, wasBullet: isBullet});
    }
  }
  
  for (const lineObj of expandedLines) {
    const trimmed = lineObj.text.trim();
    
    if (trimmed.length < 10 || trimmed.length > 500) {
      continue;
    }
    
    if (shouldExclude(trimmed)) {
      continue;
    }
    
    const isBullet = lineObj.wasBullet;
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let matchedPattern = '';
    
    if (section.isRequirementSection || section.isNiceToHaveSection) {
      if (!isBullet) {
        continue;
      }
      confidence = 'high';
      matchedPattern = section.isNiceToHaveSection ? 'nice_to_have_section' : 'requirement_section';
    } else {
      continue;
    }
    
    const cleanText = cleanRequirementText(trimmed);
    
    if (cleanText.length > 10) {
      const type = determineRequirementType(cleanText, section.isNiceToHaveSection);
      
      requirements.push({
        text: cleanText,
        confidence,
        category: categorizeRequirement(cleanText),
        source: matchedPattern,
        type
      });
    }
  }
  
  return requirements;
}

function shouldExclude(text: string): boolean {
  const lower = text.toLowerCase();
  
  const excludePatterns = [
    /^for more information/i,
    /^please visit/i,
    /^to apply/i,
    /^interested in/i,
    /^click here/i,
    /^apply now/i,
    /^we offer/i,
    /^benefits include/i,
    /^equal opportunity employer/i,
    /^we are an equal/i,
    /^\w+@\w+\.\w+/,
    /^https?:\/\//i,
    /^copyright/i,
    /^all rights reserved/i,
    /is committed to/i,
    /is an equal opportunity/i,
    /does not discriminate/i,
    /reasonable accommodation/i,
    /if you are an applicant/i,
    /if you require/i,
    /please contact us/i,
    /prides itself/i,
    /proud to invest in benefits/i,
    /parental leave/i,
    /401\(k\)/i,
    /health.*dental.*vision/i,
    /reimbursement account/i
  ];
  
  return excludePatterns.some(pattern => pattern.test(text));
}

function isResponsibility(text: string): boolean {
  const responsibilityVerbs = [
    'responsible for',
    'conducts',
    'provides',
    'maintains',
    'assists',
    'supports',
    'manages',
    'coordinates',
    'develops',
    'creates',
    'implements',
    'monitors',
    'performs',
    'executes',
    'oversees',
    'leads',
    'facilitates',
    'delivers',
    'ensures',
    'participates in',
    'collaborates',
    'works with',
    'builds',
    'designs',
    'analyzes'
  ];
  
  const lower = text.toLowerCase();
  
  const startsWithResponsibility = responsibilityVerbs.some(verb => 
    lower.startsWith(verb) || lower.match(new RegExp(`^${verb}\\s`))
  );
  
  if (!startsWithResponsibility) {
    return false;
  }
  
  const requirementIndicators = [
    'required',
    'preferred',
    'must have',
    'must be',
    'minimum',
    'maximum',
    'degree',
    'bachelor',
    'master',
    'phd',
    'certification',
    'years of experience',
    'experience with',
    'experience in',
    'knowledge of',
    'ability to',
    'understanding of',
    'familiarity with',
    'expertise in',
    'skills',
    'strong',
    'hands-on'
  ];
  
  const hasRequirementIndicator = requirementIndicators.some(indicator => 
    lower.includes(indicator)
  );
  
  return startsWithResponsibility && !hasRequirementIndicator;
}

function hasStrongRequirementPattern(text: string): boolean {
  const strongPatterns = [
    /^(minimum|maximum|min|max|at least)\s+\d+\+?\s+(years?|yrs?)/i,
    /^bachelor'?s?\s+(degree|of)/i,
    /^master'?s?\s+(degree|of)/i,
    /^(phd|doctorate|mba)/i,
    /^must\s+(have|be|possess)/i,
    /^required:/i,
    /^requires?\s+/i,
    /^experience\s+(with|in|using)/i,
  ];
  
  return strongPatterns.some(pattern => pattern.test(text));
}

function hasRequirementPattern(text: string): boolean {
  const patterns = [
    /\d+\+?\s+(years?|yrs?)\s+(of\s+)?(experience|exp)/i,
    /(bachelor|master|phd|doctorate|degree)/i,
    /^(proficiency|proficient|knowledge|understanding|experience)\s+(in|of|with)/i,
    /^(strong|solid|deep|expert|extensive)\s+(knowledge|understanding|experience|troubleshooting|analytical|skills)/i,
    /^(expertise|expert)\s+(in|with)/i,
    /^hands-on\s+(experience|knowledge)/i,
    /^ability to/i,
    /^capable of/i,
    /^familiar(ity)?\s+with/i,
    /^working knowledge/i,
    /^demonstrated (experience|ability)/i,
    /^proven (track record|experience|ability)/i,
    /(certification|certified)/i,
    /\b(required|preferred|desired|essential)\b/i,
    /\ba plus\b/i,
    /\bnice to have\b/i,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

function cleanRequirementText(text: string): string {
  let cleaned = text
    .replace(/^[\•\-\*\+]\s*/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .trim();
  
  return cleaned;
}

function determineRequirementType(text: string, inNiceToHaveSection: boolean): 'required' | 'nice-to-have' {
  if (inNiceToHaveSection) {
    return 'nice-to-have';
  }
  
  const lower = text.toLowerCase();
  
  const niceToHavePhrases = [
    'a plus',
    'nice to have',
    'would be a plus',
    'is a plus',
    'bonus',
    'desirable',
    'optional',
    'ideal',
    'nice-to-have',
    'not required'
  ];
  
  if (niceToHavePhrases.some(phrase => lower.includes(phrase))) {
    return 'nice-to-have';
  }
  
  if (lower.includes('preferred') && !lower.includes('can be substituted')) {
    return 'nice-to-have';
  }
  
  return 'required';
}

function categorizeRequirement(text: string): string {
  const lower = text.toLowerCase();
  
  if (/\d+\+?\s+(years?|yrs?)/.test(lower)) {
    return 'experience';
  }
  
  if (/(bachelor|master|phd|doctorate|degree)/.test(lower)) {
    return 'education';
  }
  
  if (/(certification|certified|certificate)/.test(lower)) {
    return 'certification';
  }
  
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'azure',
    'docker', 'kubernetes', 'git', 'api', 'database', 'framework'
  ];
  
  if (techKeywords.some(kw => lower.includes(kw))) {
    return 'technical_skill';
  }
  
  const softSkillKeywords = [
    'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
    'analytical', 'detail-oriented', 'organized', 'self-motivated'
  ];
  
  if (softSkillKeywords.some(kw => lower.includes(kw))) {
    return 'soft_skill';
  }
  
  return 'general';
}

function deduplicateRequirements(requirements: ExtractedRequirement[]): ExtractedRequirement[] {
  const seen = new Map<string, ExtractedRequirement>();
  
  for (const req of requirements) {
    const normalized = req.text.toLowerCase().trim();
    
    if (!seen.has(normalized)) {
      seen.set(normalized, req);
    } else {
      const existing = seen.get(normalized)!;
      if (req.confidence === 'high' && existing.confidence !== 'high') {
        seen.set(normalized, req);
      }
    }
  }
  
  return Array.from(seen.values())
    .sort((a, b) => {
      const confOrder = { high: 0, medium: 1, low: 2 };
      return confOrder[a.confidence] - confOrder[b.confidence];
    });
}
