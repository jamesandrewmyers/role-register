import type { VisualSection } from './htmlParser';

export interface ExtractedDescriptionDetails {
  requirements: string[];
  nicetohave: string[];
  responsibilities: string[];
  benefits: string[];
}

/**
 * Extracts and consolidates job listing details from visual sections.
 * Groups sections by type (requirements, responsibilities, benefits) and
 * consolidates their content into lists of strings.
 * 
 * @param sections - Array of VisualSection objects from parseVisualSections
 * @returns ExtractedDescriptionDetails with consolidated lists for each section type
 * 
 * @example
 * const sections = parseVisualSections(rootNode);
 * const details = extractDescriptionDetails(sections);
 * // Returns:
 * // {
 * //   requirements: ['10+ years experience', 'Bachelor degree', ...],
 * //   responsibilities: ['Lead design', 'Mentor team', ...],
 * //   benefits: ['Health insurance', '401k matching', ...]
 * // }
 */
export function extractDescriptionDetails(sections: VisualSection[]): ExtractedDescriptionDetails {
  const result: ExtractedDescriptionDetails = {
    requirements: [],
    nicetohave: [],
    responsibilities: [],
    benefits: []
  };

  const labelMap: Record<string, keyof ExtractedDescriptionDetails> = {
    'Requirements': 'requirements',
    'Qualifications': 'requirements',
    'Nice to have': 'nicetohave',
    'Preferred': 'nicetohave',
    'Responsibilities': 'responsibilities',
    'Benefits': 'benefits'
  };

  const sortedSections = [...sections].sort((a, b) => {
    const aLabel = a.label || '';
    const bLabel = b.label || '';
    return aLabel.localeCompare(bLabel);
  });

  for (const section of sortedSections) {
    if (!section.type || section.type === 'section') continue;
    if (!section.label) continue;

    const targetKey = labelMap[section.label];
    if (!targetKey) continue;

    const content = section.content.trim();
    if (!content) continue;

    const lines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    result[targetKey].push(...lines);
  }

  return result;
}
