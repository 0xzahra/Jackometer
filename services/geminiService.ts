import { GoogleGenAI, Type, FunctionDeclaration, Modality, Schema } from "@google/genai";
import { ProjectTitle, SlideDeck, CVData, AnalysisResult, YouTubeVideo, Citation } from "../types";

const API_KEY = process.env.API_KEY || '';

const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

// --- UTILS ---
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  let blobContent = content;
  
  if (mimeType.includes('msword') || mimeType.includes('opendocument')) {
      blobContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${filename}</title></head>
        <body style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
          ${content.replace(/\n\n/g, '<p>').replace(/\n/g, '<br>')}
        </body></html>
      `;
  } else if (mimeType.includes('csv') || mimeType.includes('text')) {
      blobContent = `\uFEFF${content}`; // BOM for UTF-8
  }

  const blob = new Blob([blobContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- RESEARCH ENGINE ---
export const generateResearchTitles = async (topic: string): Promise<ProjectTitle[]> => {
  const ai = getAI();
  const prompt = `
    You are Jackometer, an elite academic research assistant.
    The user wants research project titles for the topic: "${topic}".
    Provide 3-5 distinct, high-level, unique project titles suitable for an MSc or PhD level.
    For each title, explain what is needed (requirements) to execute it.
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'description', 'requirements']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateDeepResearch = async (title: string, chapter: string, context: string) => {
  const ai = getAI();
  const prompt = `
    Title: ${title}
    Chapter: ${chapter}
    Context/Outline: ${context}
    
    Write the content for this chapter. 
    Style: Academic, "Old Money" authority, 20+ years experience.
    Strictly academic format (APA 7th Edition). 
    
    CRITICAL CITATION RULES:
    1. You MUST use Google Search to find real sources.
    2. Every factual claim must be immediately followed by a citation link in this format: [Short Source Title](URL).
    3. Do NOT use footnotes or [1]. Use the [Title](URL) format inline.
    4. At the very end of the response, create a section called "URL Context References". In this section, list every URL used and provide a 1-sentence "Preview" of what that link contains.

    Use high-level vocabulary.
    Do NOT use markdown symbols for headers like **, ##. Format as plain, beautifully written text, but keep the links.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 1024 },
      tools: [{ googleSearch: {} }] 
    }
  });
  
  return response.text;
};

export const searchYouTubeVideos = async (topic: string): Promise<YouTubeVideo[]> => {
  const ai = getAI();
  const prompt = `
    Find 3 high-quality educational YouTube videos related to: "${topic}".
    Return the title, a valid watch URL, and a short description for each.
    Output JSON.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// --- FIELD TRIP & LAB ---
export const generateFieldTripDocument = async (topic: string, tables: string, notes: string): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Generate a comprehensive Field Trip Report Document.
      Topic: ${topic}
      Data Tables provided: ${tables}
      Field Notes: ${notes}
      
      Structure:
      1. Introduction
      2. Methodology (Include specific location data if provided)
      3. Results (incorporate the table data textually)
      4. Discussion
      5. Conclusion
      6. References & URL Context
      
      Tone: Academic, Formal.
      
      CITATION REQUIREMENT:
      - Use Google Search to back up ecological/geological facts.
      - Cite sources inline using Markdown links: [Source Name](URL).
      - Add a "URL Context References" section at the end describing each link.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return response.text || "";
}

export const generateRapidPresentation = async (topic: string, rawData: string): Promise<SlideDeck> => {
  const ai = getAI();
  const prompt = `
    User Topic: ${topic}
    Raw Data/Notes: ${rawData}
    
    Create a "Rapid Defense" slide deck structure.
    It should be defense-ready.
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualCue: { type: Type.STRING, description: "Description of a visual graph or image to generate" }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const estimateWeatherConditions = async (lat: number, lng: number): Promise<{temp: string, humidity: string, conditions: string}> => {
  const ai = getAI();
  const prompt = `
    Based on the coordinates ${lat}, ${lng} and the current date ${new Date().toDateString()}, 
    provide a REALISTIC estimate of the weather conditions for a field report.
    Output JSON with 'temp' (e.g. '32°C'), 'humidity' (e.g. '45%'), and 'conditions' (e.g. 'Partly Cloudy, Dry').
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temp: { type: Type.STRING },
          humidity: { type: Type.STRING },
          conditions: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"temp": "--", "humidity": "--", "conditions": "--"}');
};

// --- DOCUMENT WRITER ---
export const generateAcademicDocument = async (level: string, course: string, topic: string, details: string, appendixData: string): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Write a full academic document.
      Level: ${level} (e.g. Undergraduate, PhD)
      Course of Study: ${course}
      Topic: ${topic}
      Specific Details: ${details}
      Appendix Items (Images & Captions): ${appendixData}
      
      Requirements:
      - Thoroughly researched content using Google Search.
      - Genuine, REAL citations with URLs.
      - STRICT CITATION FORMAT: Use inline Markdown links for every fact: [Source Title](URL).
      - No "As an AI" disclaimers.
      - Tone: "Old Money" Academic Expert.
      - Include a "URL Context References" section at the end. List every URL used and a 1-sentence preview of the site content.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response.text || "";
}

export const generateBibliography = async (citations: Citation[], style: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Format the following citations into a Bibliography using ${style} style.
    Input: ${JSON.stringify(citations)}
    Return only the formatted bibliography text.
    Ensure strict adherence to the style guide (italics, punctuation).
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt
  });
  return response.text || "";
};

export const generateTechnicalReport = async (topic: string, details: string, tables: string, appendix: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Generate a full Student Industrial Work Experience Scheme (SIWES) or Technical Report on: ${topic}.
    Details: ${details}.
    Data Tables: ${tables}.
    Appendix: ${appendix}.

    Structure: Introduction, Experience Gained, Technical Procedures, Challenges, Conclusion, References.
    Tone: Professional, Experienced, Academic.
    
    CITATIONS: Use Google Search. Hyperlink every external fact using [Source](URL). 
    Add a "URL Context" section at the end with descriptions of the links.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const generateLabReport = async (experiment: string, observations: string, tables: string, appendix: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Generate a comprehensive Lab Report for experiment: ${experiment}.
    Observations: ${observations}.
    Data Tables: ${tables}.
    Appendix (Images/Captions): ${appendix}.

    Structure: Title, Aim, Apparatus, Procedure, Results (Tabulated), Calculation, Discussion (Biological & Chemical analysis), Conclusion, References.
    Focus on biological and chemical observations inferred from the data.
    
    CITATIONS: Use Google Search to back up scientific claims. Hyperlink sources inline: [Source](URL).
    Add a "URL Context" section at the end with descriptions of the links.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const analyzeMicroscopeImage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    You are an expert biologist and chemist.
    Analyze this microscope image (or lab sample image).
    
    1. IDENTIFICATION: Identify the specimen/organism or chemical substance.
    2. BIOLOGICAL ANALYSIS: Describe morphology (shape, stain, arrangement, organelles, cell wall, nuclei). Identify the phase (mitosis, etc.) if applicable.
    3. CHEMICAL ANALYSIS: Note any color changes, precipitation, viscosity, crystalline structures, or indications of chemical reaction.
    4. CLASSIFICATION: Provide the scientific classification or compound identity.
    
    Be precise and academic.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  return response.text || "Analysis complete but no text returned.";
};

export const generateImageCaption = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Generate a concise, academic caption for this image to be used in an Appendix.
    Identify what is shown (e.g., "Figure 1: Microscopic view of Spyrogyra...").
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  return response.text || "Figure: Image content.";
};

// --- DATA CRUNCHER (OPTIMIZED) ---
export const analyzeData = async (dataInput: string, tableData: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Perform a rigorous statistical and bio-systematic analysis of the following data.
    Input Text: ${dataInput}
    Input Tables: ${tableData}
    
    Requirements:
    1. Accuracy: Ensure zero errors in calculation.
    2. Complexity: Handle bio-systematics and statistical variance.
    3. Output: Simplified JSON structure.
    
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Pro model for maximum accuracy
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 2048 }, // Allow thinking for precision
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

// --- ASSIGNMENT SUITE (Reviewer 2) ---
export const gradeEssay = async (essay: string, instruction: string): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Act as "Reviewer 2": A strict, expert academic external examiner.
      Task: Grade and critique the following student essay.
      Additional Instructions: ${instruction}
      
      Essay Content:
      ${essay}
      
      Output Structure:
      1. Letter Grade (e.g. A, B-, F)
      2. Brutal Critique (Point out weak arguments, passive voice, lack of evidence).
      3. Reference Check (Identify missing or weak citations).
      4. "Bias Decoder" (Suggestions to improve tone for a specific lecturer archetype).
      5. Corrected Snippet (Rewrite the weakest paragraph to be perfect).
      
      Hyperlink any resources you suggest using [Resource Name](URL).
    `;
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const synthesizeCritique = async (sourceMaterial: string): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Act as an academic critic.
      Task: Write a critical review essay based on the provided source material/link.
      Source: ${sourceMaterial}
      
      Requirements:
      - 100% Unique, non-plagiarized output.
      - Analyze the arguments, methodology, and conclusions of the source.
      - Critique the validity.
      - Tone: High-level academic discourse.
      - Use Google Search to cross-reference facts. 
      - CITE every external fact with an inline link: [Source](URL).
      - End with a "URL Context" section describing the sources.
    `;
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const solveAssignment = async (question: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Task: Solve this academic assignment question with excellence.
    Question: ${question}

    Requirements:
    - Write a complete, high-quality, comprehensive academic response.
    - Style: Human-like, "Old Money" academic, sophisticated but natural.
    - Avoid robotic transitions.
    - If factual claims are made, you MUST use Google Search to find real sources and cite them using [Source Title](URL).
    - At the very end of the response, append a brief "Pre-Grading Verdict" section explaining why this response meets "A-Grade" criteria (already judged).
    - Include a "URL Context" section at the bottom for references.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

// --- CAREER STUDIO ---
export const generatePassportEdit = async (base64Image: string, backgroundType: 'white' | 'red'): Promise<string> => {
  const ai = getAI();
  const prompt = `Change the background of this person to a solid ${backgroundType} background suitable for an official passport photo. Crop to headshot if needed.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image generated");
};

export const generateOptimizedCV = async (data: CVData): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Create a high-impact, "Old Money" academic CV (Curriculum Vitae) based on:
      ${JSON.stringify(data)}
      Format: Plain text, sophisticated layout, academic focus.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
}

export const generateResume = async (data: CVData): Promise<string> => {
    const ai = getAI();
    const prompt = `
      Create a professional, 1-page Industry Resume based on:
      ${JSON.stringify(data)}
      Format: Plain text, bullet points, action verbs.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
}