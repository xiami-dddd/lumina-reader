
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AppMode, HighlightConfig } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export interface ParsedDocument {
  title: string;
  author: string;
  content: string;
}

export const parseDocument = async (base64Data: string, mimeType: string): Promise<ParsedDocument> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Analyze this document. 1. Extract the full text content accurately, preserving line breaks. 2. Identify the Title and Author of the document from its content or metadata. If they cannot be found, provide reasonable placeholders like 'Unknown Title' or 'Unknown Author'. Return the result as a JSON object."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the book or document" },
            author: { type: Type.STRING, description: "The author of the book or document" },
            content: { type: Type.STRING, description: "The full extracted text content" }
          },
          required: ["title", "author", "content"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      title: result.title || "未命名文档",
      author: result.author || "未知作者",
      content: result.content || ""
    };
  } catch (error) {
    console.error("Document parsing error:", error);
    throw new Error("Failed to parse document. Please try a different format or paste text manually.");
  }
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const applyHighlightsLocally = (text: string, properNouns: string[], topicHotWords: string[]): string => {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, '<br/><br/>');

  const sortTerms = (terms: string[]) => terms.filter(t => t && t.length > 1).sort((a, b) => b.length - a.length);

  const sortedProperNouns = sortTerms(properNouns);
  const sortedHotWords = sortTerms(topicHotWords);

  // Apply Proper Nouns (Solid block style)
  sortedProperNouns.forEach(term => {
    const escapedTerm = escapeRegExp(term);
    const isAscii = /^[\x00-\x7F]+$/.test(term);
    const pattern = isAscii ? `\\b${escapedTerm}\\b` : escapedTerm;
    
    const regex = new RegExp(pattern, 'gi');
    html = html.replace(regex, (match) => {
      return `<span data-term="${match.replace(/"/g, '&quot;')}" data-type="proper" class="cursor-pointer transition-colors px-1 mx-0.5 rounded-sm bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100">${match}</span>`;
    });
  });

  // Apply Topic Hot Words (Solid block style)
  sortedHotWords.forEach(term => {
    const escapedTerm = escapeRegExp(term);
    const isAscii = /^[\x00-\x7F]+$/.test(term);
    const boundary = isAscii ? '\\b' : '';
    const pattern = `(${boundary}${escapedTerm}${boundary})(?![^<]*>)`;

    try {
      const regex = new RegExp(pattern, 'gi');
      html = html.replace(regex, (match, p1) => {
        return `<span data-term="${p1.replace(/"/g, '&quot;')}" data-type="hotword" class="cursor-pointer transition-colors px-1 mx-0.5 rounded-sm bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100">${p1}</span>`;
      });
    } catch (e) {}
  });

  return html;
};

export const applyNovelHighlights = (
  text: string, 
  nouns: string[], 
  verbs: string[], 
  adjectives: string[], 
  config: HighlightConfig
): string => {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, '<br/><br/>');

  const activeNouns = config.nouns.enabled ? nouns : [];
  const activeVerbs = config.verbs.enabled ? verbs : [];
  const activeAdjectives = config.adjectives.enabled ? adjectives : [];

  const applyCategory = (terms: string[], color: string, type: string) => {
    if (!terms || terms.length === 0) return;
    const sortedTerms = terms.filter(t => t && t.length > 1).sort((a, b) => b.length - a.length);
    
    // 减小垂直 padding (0px) 使色块高度缩短，同时设置 inline-block 和 vertical-align 确保对齐
    const style = `background-color: ${color}4d; padding: 0px 4px; border-radius: 3px; color: inherit; vertical-align: baseline;`;

    sortedTerms.forEach(term => {
      const escapedTerm = escapeRegExp(term);
      const isAscii = /^[\x00-\x7F]+$/.test(term);
      const pattern = isAscii ? `\\b${escapedTerm}\\b` : escapedTerm;
      const regexStr = `(${pattern})(?![^<]*>)`; 
      
      try {
        const regex = new RegExp(regexStr, 'gi');
        html = html.replace(regex, (match, p1) => {
          if (p1.includes('<span')) return p1;
          return `<span class="transition-colors inline-block leading-tight" style="${style}">${p1}</span>`;
        });
      } catch (e) {}
    });
  };

  applyCategory(activeNouns, config.nouns.color, "noun");
  applyCategory(activeVerbs, config.verbs.color, "verb");
  applyCategory(activeAdjectives, config.adjectives.color, "adj");

  return html;
};

export const explainTerm = async (term: string, contextSnippet: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Context: Reading Assistant. Term: "${term}" Task: Explain this term concisely in Simplified Chinese (简体中文). Keep it under 60 words. Plain text only.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "暂无解释";
  } catch (e) {
    return "无法获取解释";
  }
}

export const analyzeContent = async (text: string, mode: AppMode): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const truncatedText = text.substring(0, 4500);
  const safeText = JSON.stringify(truncatedText);

  if (mode === AppMode.NOVEL) {
    const prompt = `Analyze for "Novel Mode": Detect language, extract nouns, verbs, adjectives. Return ONLY JSON: {"nouns":[], "verbs":[], "adjectives":[]}. Text: ${safeText}`;
    try {
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
      const data = JSON.parse(response.text || "{}");
      return { nouns: data.nouns || [], verbs: data.verbs || [], adjectives: data.adjectives || [], annotatedHtml: "" };
    } catch (e) {
      return { annotatedHtml: truncatedText.replace(/\n/g, '<br/>') };
    }
  } else if (mode === AppMode.PAPER) {
    const prompt = `Analyze for "Paper Mode": Provide summary (Chinese, max 3 sentences), 5 keywords. Identify domain-specific properNouns and topicHotWords. STRICTLY EXCLUDE common daily words (e.g. 粗鲁, 敬畏, 军官). Only include academic or technical terms. Return JSON: {"summary":"", "keywords":[], "properNouns":[], "topicHotWords":[]}. Text: ${safeText}`;
    try {
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
      const data = JSON.parse(response.text || "{}");
      const annotatedHtml = applyHighlightsLocally(truncatedText, data.properNouns || [], data.topicHotWords || []);
      return { summary: data.summary, keywords: data.keywords, annotatedHtml };
    } catch (e) {
      return { summary: "Analysis failed.", annotatedHtml: truncatedText.replace(/\n/g, '<br/><br/>') };
    }
  }
  return {};
};
