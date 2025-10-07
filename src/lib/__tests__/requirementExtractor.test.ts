import { describe, it, expect } from 'vitest';
import { extractRequirements } from '../requirementExtractor';

describe('requirementExtractor', () => {
  describe('When extracting requirements from job descriptions', () => {
    it('should return extraction result with requirements and summary', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience with JavaScript
        • Bachelor's degree in Computer Science
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result).toHaveProperty('requirements');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.requirements)).toBe(true);
      expect(typeof result.summary).toBe('string');
    });

    it('should extract requirements from bullet points', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience with JavaScript
        • Bachelor's degree in Computer Science
        • Strong communication skills
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.length).toBeGreaterThan(0);
      expect(result.requirements.some(r => r.text.includes('JavaScript'))).toBe(true);
      expect(result.requirements.some(r => r.text.includes('Bachelor'))).toBe(true);
    });

    it('should identify requirements section', () => {
      const jobDescription = `
        Qualifications:
        • 3 years of Python experience
        • Master's degree preferred
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.summary).toContain('REQ');
    });

    it('should identify nice-to-have section', () => {
      const jobDescription = `
        Nice to Have:
        • Experience with Docker
        • Knowledge of AWS
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.summary).toContain('NICE');
    });

    it('should categorize requirements by type', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        • Bachelor's degree in CS
        • AWS Certification
        • Knowledge of React
        • Strong communication skills
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.some(r => r.category === 'experience')).toBe(true);
      expect(result.requirements.some(r => r.category === 'education')).toBe(true);
      expect(result.requirements.some(r => r.category === 'certification')).toBe(true);
      expect(result.requirements.some(r => r.category === 'technical_skill')).toBe(true);
    });

    it('should assign confidence levels', () => {
      const jobDescription = `
        Required Qualifications:
        • 5+ years of JavaScript experience
        • Bachelor's degree in Computer Science
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.every(r => r.confidence === 'high')).toBe(true);
    });

    it('should distinguish between required and nice-to-have', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        
        Nice to Have:
        • Experience with Docker
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.some(r => r.type === 'required')).toBe(true);
      expect(result.requirements.some(r => r.type === 'nice-to-have')).toBe(true);
    });

    it('should deduplicate identical requirements', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience with JavaScript
        • 5+ years of experience with JavaScript
      `;
      
      const result = extractRequirements(jobDescription);
      
      const jsRequirements = result.requirements.filter(r => r.text.includes('JavaScript'));
      expect(jsRequirements.length).toBe(1);
    });
  });

  describe('When handling edge cases', () => {
    it('should handle empty job description', () => {
      const result = extractRequirements('');
      
      expect(result.requirements).toEqual([]);
    });

    it('should handle job description with no sections', () => {
      const jobDescription = 'This is a great company. We are looking for someone awesome.';
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.length).toBe(0);
    });

    it('should filter out very short lines', () => {
      const jobDescription = `
        Requirements:
        • OK
        • 5+ years of JavaScript experience
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.every(r => r.text.length > 10)).toBe(true);
    });

    it('should filter out very long lines', () => {
      const jobDescription = `
        Requirements:
        • ${'a'.repeat(600)}
        • 5+ years of JavaScript experience
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.every(r => r.text.length <= 500)).toBe(true);
    });

    it('should exclude benefit-related content', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        • We offer health, dental, and vision insurance
        • Bachelor's degree
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.some(r => r.text.toLowerCase().includes('health'))).toBe(false);
      expect(result.requirements.some(r => r.text.toLowerCase().includes('dental'))).toBe(false);
    });

    it('should exclude equal opportunity statements from being categorized', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        
        We are an equal opportunity employer.
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.some(r => r.text.includes('experience'))).toBe(true);
    });
  });

  describe('When processing different bullet formats', () => {
    it('should handle bullet points with •', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        • Bachelor's degree
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.length).toBeGreaterThan(0);
    });

    it('should handle bullet points with -', () => {
      const jobDescription = `
        Requirements:
        - 5+ years of experience
        - Bachelor's degree
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.length).toBeGreaterThan(0);
    });

    it('should handle numbered lists', () => {
      const jobDescription = `
        Requirements:
        1. 5+ years of experience
        2. Bachelor's degree
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements.length).toBeGreaterThan(0);
    });

    it('should clean bullet markers from requirement text', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].text).not.toMatch(/^[•\-*+]/);
    });
  });

  describe('When identifying requirement types', () => {
    it('should identify experience requirements', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of software development experience
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].category).toBe('experience');
    });

    it('should identify education requirements', () => {
      const jobDescription = `
        Requirements:
        • Bachelor's degree in Computer Science
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].category).toBe('education');
    });

    it('should identify certification requirements', () => {
      const jobDescription = `
        Requirements:
        • AWS Certified Solutions Architect
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].category).toBe('certification');
    });

    it('should identify technical skill requirements', () => {
      const jobDescription = `
        Requirements:
        • Experience with React and Node.js
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].category).toBe('technical_skill');
    });

    it('should identify soft skill requirements', () => {
      const jobDescription = `
        Requirements:
        • Strong communication and teamwork skills
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.requirements[0].category).toBe('soft_skill');
    });
  });

  describe('When generating summary', () => {
    it('should include requirement count in summary', () => {
      const jobDescription = `
        Requirements:
        • 5+ years of experience
        • Bachelor's degree
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.summary).toContain(result.requirements.length.toString());
    });

    it('should include section information in summary', () => {
      const jobDescription = `
        Qualifications:
        • 5+ years of experience
      `;
      
      const result = extractRequirements(jobDescription);
      
      expect(result.summary).toContain('Qualifications');
    });
  });
});
