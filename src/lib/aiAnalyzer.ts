import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local cache
env.localModelPath = 'models/';
env.allowRemoteModels = true; // Download models on first use
env.allowLocalModels = true;

let classificationModel: Awaited<ReturnType<typeof pipeline>> | null = null;

async function initModel() {
  if (!classificationModel) {
    console.log('[AI Analyzer] Initializing zero-shot classification model...');
    classificationModel = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    console.log('[AI Analyzer] Model ready');
  }
  return classificationModel;
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Split on line breaks first
  const lines = text.split(/\n+/);
  
  const sentences: string[] = [];
  
  for (const line of lines) {
    // Further split each line by sentence-ending punctuation
    const lineSentences = line
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
    
    sentences.push(...lineSentences);
  }
  
  return sentences;
}

export async function extractJobRequirements(jobDescription: string): Promise<{
  requirements: string[];
  summary: string;
  rawAnalysis: string;
}> {
  try {
    console.log('[AI Analyzer] Processing job description with AI...');
    
    const model = await initModel();
    
    const sentences = splitIntoSentences(jobDescription);
    console.log(`[AI Analyzer] Split description into ${sentences.length} sentences`);
    
    const requirements: string[] = [];
    const analysisResults: string[] = [];

    for (const sentence of sentences) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (model as any)(sentence, ['job requirement', 'not a requirement']) as {
          labels: string[];
          scores: number[];
        };
        
        if (result && result.labels && result.scores) {
          const topLabel = result.labels[0];
          const confidence = result.scores[0];
          
          if (topLabel === 'job requirement' && confidence > 0.5) {
            requirements.push(sentence);
            analysisResults.push(`✓ ${sentence} (${(confidence * 100).toFixed(1)}%)`);
          } else {
            analysisResults.push(`✗ ${sentence} [${topLabel}] (${(confidence * 100).toFixed(1)}%)`);
          }
        }
      } catch {
        continue;
      }
    }

    const summary = requirements.length > 0
      ? `AI identified ${requirements.length} requirements from ${sentences.length} sentences.`
      : 'No clear requirements identified by AI analysis.';

    console.log(`[AI Analyzer] Extracted ${requirements.length} requirements`);

    return {
      requirements,
      summary,
      rawAnalysis: analysisResults.join('\n'),
    };
  } catch (error) {
    console.error('[AI Analyzer] Error analyzing job description:', error);
    
    console.log('[AI Analyzer] Falling back to pattern matching...');
    return {
      requirements: extractRequirementsFromText(jobDescription),
      summary: 'AI analysis unavailable - using pattern matching fallback',
      rawAnalysis: `Error: ${String(error)}`,
    };
  }
}


/**
 * Extract requirements using pattern matching (fallback when AI fails)
 */
function extractRequirementsFromText(description: string): string[] {
  const requirements: string[] = [];
  const text = description.toLowerCase();

  // Technical skills patterns
  const techPatterns = [
    /\b(react|vue|angular|node\.?js|python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
    /\b(sql|nosql|mongodb|postgresql|mysql|redis|elasticsearch)\b/gi,
    /\b(aws|azure|gcp|docker|kubernetes|jenkins|ci\/cd)\b/gi,
    /\b(git|github|gitlab|bitbucket|version control)\b/gi,
    /\b(agile|scrum|kanban|jira|devops)\b/gi,
  ];

  // Education patterns
  const educationPatterns = [
    /bachelor'?s?\s+degree/gi,
    /master'?s?\s+degree/gi,
    /phd|doctorate/gi,
    /computer science|engineering|related field/gi,
  ];

  // Experience patterns
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /senior|junior|mid-level|lead/gi,
  ];

  // Extract technical skills
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim();
        if (normalized && !requirements.some(r => r.toLowerCase().includes(normalized))) {
          requirements.push(normalized.charAt(0).toUpperCase() + normalized.slice(1));
        }
      });
    }
  });

  // Extract education requirements
  educationPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim();
        if (!requirements.some(r => r.toLowerCase().includes(normalized.toLowerCase()))) {
          requirements.push(normalized);
        }
      });
    }
  });

  // Extract experience requirements
  experiencePatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim();
        if (!requirements.some(r => r.toLowerCase().includes(normalized.toLowerCase()))) {
          requirements.push(normalized);
        }
      });
    }
  });

  // Look for bullet points or line items
  const lines = description.split(/\n|•|·|■/);
  lines.forEach(line => {
    const trimmed = line.trim();
    // If line starts with common requirement indicators and is reasonable length
    if (trimmed.length > 10 && trimmed.length < 200) {
      const indicators = /^(required|must have|should have|need|require|experience with|proficiency|knowledge of)/i;
      if (indicators.test(trimmed)) {
        requirements.push(trimmed);
      }
    }
  });

  // Deduplicate and limit
  return Array.from(new Set(requirements)).slice(0, 20);
}

/**
 * Analyze text complexity and readability
 */
export function analyzeTextComplexity(text: string): {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  technicalTermCount: number;
} {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const technicalTerms = [
    /\b(api|sdk|framework|library|database|algorithm|architecture)\b/gi,
    /\b(frontend|backend|fullstack|devops|cicd)\b/gi,
  ];
  
  let technicalTermCount = 0;
  technicalTerms.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) technicalTermCount += matches.length;
  });

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
    technicalTermCount,
  };
}
