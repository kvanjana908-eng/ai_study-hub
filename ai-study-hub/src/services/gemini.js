/**
 * MindSpark AI - Gemini Multi-Agent Architecture
 * Powered 100% dynamically by Google Gemini API.
 * ZERO hardcoded templates, static question banks, or rule-based logic.
 */

const DEFAULT_API_KEY = '';
const DEFAULT_MODEL = 'gemini-2.0-flash';

export const getStoredApiKey = () => {
  return localStorage.getItem('mindspark_gemini_key') || DEFAULT_API_KEY;
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem('mindspark_gemini_key', key.trim());
  } else {
    localStorage.removeItem('mindspark_gemini_key');
  }
};

export const getStoredModel = () => {
  return localStorage.getItem('mindspark_gemini_model') || DEFAULT_MODEL;
};

export const setStoredModel = (model) => {
  localStorage.setItem('mindspark_gemini_model', model);
};

/**
 * Core Gemini API Fetch Client
 */
async function callGeminiAPI({ prompt, systemInstruction, responseSchema = null, imageBase64 = null, mimeType = null }) {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  if (!apiKey) {
    throw new Error('No Gemini API key found. Please enter a key in Settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  const parts = [];

  // Handle multimodal binary inputs (PDF, PNG, JPG, WEBP, Audio, etc.)
  if (imageBase64 && mimeType) {
    const cleanData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanData
      }
    });
  }
  parts.push({ text: prompt });

  contents.push({
    role: 'user',
    parts
  });

  const bodyPayload = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseSchema) {
    bodyPayload.generationConfig.responseMimeType = "application/json";
    bodyPayload.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedErr = errorText;
    try {
      const errObj = JSON.parse(errorText);
      parsedErr = errObj.error?.message || errorText;
    } catch (e) { }
    throw new Error(`Gemini API Error (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Gemini API returned an empty response. Please verify document readability.');
  }

  return candidate.content.parts[0].text;
}

/**
 * Helper to safely extract JSON from Gemini API text
 */
function cleanAndParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (innerErr) {
        console.error('JSON match parse error:', innerErr);
      }
    }
    throw new Error(`Failed to parse JSON response from Gemini AI: ${text.substring(0, 180)}...`);
  }
}

// =========================================================================
// AGENT 1: DOCUMENT UNDERSTANDING & OCR AGENT
// =========================================================================

/**
 * Generate complete study guide notebook from any topic prompt (e.g. "Quantum Computing")
 */
export async function generateTopicMaterial(topicName) {
  const systemInstruction = `You are Agent 1 (Document Understanding & Educational Curriculum Expert). Given a topic, generate a comprehensive, structured study material notebook in Markdown with headings, overview, core principles, formulas (in LaTeX $...$ or $$...$$), real-world applications, and key takeaways.`;
  const prompt = `Create an in-depth educational study guide for the topic: "${topicName}". Include sections: Overview, Core Principles, Detailed Breakdown, Essential Terms, Formulas & Rules, and Applications.`;

  return await callGeminiAPI({ prompt, systemInstruction });
}

/**
 * Process single or merged multi-file uploads (PDF, PNG, JPG, WEBP, Audio, Text, DOCX, PPTX)
 */
export async function generateMaterialFromFile({ fileName, fileType, mimeType, base64Data, textContent }) {
  const systemInstruction = `You are Agent 1 (Document Understanding & Multimodal OCR Agent).
Your responsibility:
1. Analyze the uploaded document/image/audio file ("${fileName}").
2. If it is an image, scanned document, handwritten note, or whiteboard photo, perform high-accuracy OCR on all text, equations, and diagrams.
3. Detect structure, headings, equations, formulas, tables, and concept hierarchy.
4. If unreadable or corrupted, politely state that the user should upload a clearer file.
5. Produce a complete, beautifully structured study guide notebook in Markdown format.

Required Notebook Layout:
# 📘 ${fileName.replace(/\.[^/.]+$/, "")}

## 💡 Executive Overview & Summary
[Clear 2-3 paragraph summary of the material]

## 🔑 Core Concepts & Essential Terms
[Bulleted list of key definitions and principles]

## 📐 Formulas, Equations & Principles (LaTeX)
[Equations in LaTeX $...$ format with explanations]

## 📝 Detailed Topic Breakdown
[In-depth educational explanations of all topics covered]

## 🎯 Key Takeaways & Exam Tips
[Essential bullet points for revision]`;

  let prompt = `Analyze file "${fileName}" and create a complete Markdown study notebook.`;
  if (fileType === 'image') prompt += ` Perform OCR on handwritten/printed text and explain visible diagrams.`;
  if (fileType === 'pdf') prompt += ` Extract text, formulas, headings, and structure from all PDF pages.`;
  if (fileType === 'audio') prompt += ` Transcribe the audio lecture and organize into structured study notes.`;

  const rawBase64 = base64Data ? (base64Data.includes(',') ? base64Data.split(',')[1] : base64Data) : null;

  if (rawBase64 && mimeType) {
    return await callGeminiAPI({
      prompt,
      systemInstruction,
      imageBase64: rawBase64,
      mimeType
    });
  } else {
    return await callGeminiAPI({
      prompt: `${prompt}\n\nFile Content:\n${(textContent || '').substring(0, 16000)}`,
      systemInstruction
    });
  }
}

/**
 * Agent 1: Multi-File Merge - Combine multiple documents into a single consolidated study guide notebook
 */
export async function mergeMaterials(materialsList) {
  const systemInstruction = `You are Agent 1 (Document Understanding & Context Consolidation Agent).
Your responsibility is to take multiple uploaded study materials and merge them into a single, cohesive, high-depth Master Study Guide Notebook.
Identify common themes, cross-connect concepts across files, eliminate redundancies, preserve all formulas and key definitions, and structure logically.

Required Layout:
# 📚 Consolidated Master Study Notebook
## 💡 Executive Synthesis
## 🔑 Master Concept Map & Definitions
## 📐 Formulas, Theorems & Equations (LaTeX)
## 📝 Deep Topic-by-Topic Synthesis
## 🎯 Unified Exam Study Checklist`;

  const combinedContent = materialsList.map((m, idx) => `--- SOURCE ${idx + 1}: ${m.title} ---\n${m.content}`).join('\n\n');
  const prompt = `Synthesize and merge the following ${materialsList.length} study sources into one master notebook:\n\n${combinedContent.substring(0, 20000)}`;

  return await callGeminiAPI({ prompt, systemInstruction });
}

// =========================================================================
// AGENT 2: LEARNING ASSISTANT AGENT (EXPLANATIONS & CHAT TUTOR)
// =========================================================================

/**
 * Generate Multi-Level Explanations (Beginner, Intermediate, Advanced)
 */
export async function explainConceptMultiLevel({ materialContent, conceptName, level = 'Intermediate' }) {
  const systemInstruction = `You are Agent 2 (Learning Assistant Agent). Explain concepts at specific learning depth levels:
- Beginner (ELI5): Uses simple everyday analogies, simple language, no jargon without explanation.
- Intermediate: Rigorous breakdown with real-world applications and key formulas.
- Advanced: Deep academic derivation, edge cases, underlying mechanics, and mathematical/code rigor.`;

  const prompt = `Based on this study material:
${materialContent.substring(0, 8000)}

Explain the concept "${conceptName || 'the core subject'}" at the **${level.toUpperCase()}** level.
Format output cleanly in Markdown with subheadings, analogies, and examples.`;

  return await callGeminiAPI({ prompt, systemInstruction });
}

/**
 * Persistent ChatGPT-Style AI Tutor Chat with Memory & Persona Support
 */
export async function askAITutor({ materialContent, question, persona = 'socratic', explanationLevel = 'Intermediate', language = 'English', chatHistory = [] }) {
  const personaPrompts = {
    socratic: "You are a Socratic AI Tutor. Guide the student by asking thoughtful follow-up questions, breaking down problems step-by-step, helping them discover answers independently.",
    feynman: "You are a Feynman Technique Expert. Explain concepts using extremely simple analogies, plain language, and zero jargon.",
    exam_prep: "You are an Exam Drill Coach. Focus on high-yield exam points, common traps, key scoring rubrics, and precise definitions.",
    math_coder: "You are a Math & Coding Specialist. Provide step-by-step derivations, code implementations with syntax highlighting, and LaTeX math formulas."
  };

  let systemInstruction = `${personaPrompts[persona] || personaPrompts.socratic}
Target Explanation Depth: ${explanationLevel}.
Language: Translate and explain in ${language}.
Always base explanations on the student's study material notebook below when relevant. Use LaTeX for math ($...$). Always be encouraging and clear.

Study Material Notebook Reference:
${materialContent.substring(0, 10000)}`;

  const formattedHistory = chatHistory.slice(-8).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n\n');
  const prompt = `${formattedHistory}\n\nStudent: ${question}\n\nTutor:`;

  return await callGeminiAPI({ prompt, systemInstruction });
}

// =========================================================================
// AGENT 3: NOTES & REVISION AGENT
// =========================================================================

/**
 * Generate Structured Summary & Key Concept Extraction
 */
export async function generateMaterialSummary(materialContent) {
  const schema = {
    type: "OBJECT",
    properties: {
      executiveSummary: { type: "STRING" },
      tldr: { type: "STRING" },
      keyConcepts: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            term: { type: "STRING" },
            definition: { type: "STRING" },
            importance: { type: "STRING" }
          },
          required: ["term", "definition", "importance"]
        }
      },
      formulasAndRules: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            expression: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["name", "expression", "explanation"]
        }
      },
      simplifiedAnalogy: { type: "STRING" }
    },
    required: ["executiveSummary", "tldr", "keyConcepts", "formulasAndRules", "simplifiedAnalogy"]
  };

  const systemInstruction = "You are Agent 3 (Notes & Revision Agent). Analyze study material and return structured JSON summary data.";
  const prompt = `Study Material:\n${materialContent.substring(0, 12000)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

/**
 * Generate Active Recall Flashcards Deck
 */
export async function generateFlashcards({ materialContent, count = 8 }) {
  const schema = {
    type: "OBJECT",
    properties: {
      deckTitle: { type: "STRING" },
      cards: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            front: { type: "STRING" },
            back: { type: "STRING" },
            hint: { type: "STRING" },
            category: { type: "STRING" }
          },
          required: ["id", "front", "back", "hint", "category"]
        }
      }
    },
    required: ["deckTitle", "cards"]
  };

  const systemInstruction = `You are Agent 3 (Notes & Revision Agent). Generate ${count} active-recall flashcards from the study material.`;
  const prompt = `Material:\n${materialContent.substring(0, 12000)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

/**
 * Generate Dynamic Mind Map (JSON Tree + Mermaid Diagram String)
 */
export async function generateMindMap({ materialContent }) {
  const schema = {
    type: "OBJECT",
    properties: {
      mermaidDiagram: { type: "STRING", description: "Valid Mermaid graph TD or mindmap syntax string" },
      root: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          label: { type: "STRING" },
          description: { type: "STRING" },
          children: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                label: { type: "STRING" },
                description: { type: "STRING" },
                color: { type: "STRING" },
                children: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      id: { type: "STRING" },
                      label: { type: "STRING" },
                      description: { type: "STRING" }
                    },
                    required: ["id", "label", "description"]
                  }
                }
              },
              required: ["id", "label", "description", "children"]
            }
          }
        },
        required: ["id", "label", "description", "children"]
      }
    },
    required: ["mermaidDiagram", "root"]
  };

  const systemInstruction = "You are Agent 3 (Notes & Revision Agent). Construct a hierarchical concept Mind Map tree and a valid Mermaid diagram string from the material.";
  const prompt = `Study Material:\n${materialContent.substring(0, 12000)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

// =========================================================================
// AGENT 4: QUIZ GENERATION AGENT
// =========================================================================

/**
 * Generate Dynamic Quizzes (MCQ, True/False, Fill-in-Blanks, Short/Long Answer, Scenario, Numerical)
 */
export async function generateQuiz({ materialContent, numQuestions = 5, difficulty = 'Intermediate', types = ['multiple_choice', 'short_answer', 'true_false', 'fill_in_blank', 'numerical'] }) {
  const schema = {
    type: "OBJECT",
    properties: {
      quizTitle: { type: "STRING" },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            type: { type: "STRING", description: "multiple_choice, true_false, fill_in_blank, short_answer, long_answer, scenario, numerical" },
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" }, description: "Options if MCQ or True/False" },
            correctAnswer: { type: "STRING" },
            explanation: { type: "STRING" },
            conceptTag: { type: "STRING" },
            hints: { type: "STRING" }
          },
          required: ["id", "type", "question", "correctAnswer", "explanation", "conceptTag"]
        }
      }
    },
    required: ["quizTitle", "questions"]
  };

  const systemInstruction = `You are Agent 4 (Quiz Generation Agent). Generate a ${difficulty}-level quiz with exactly ${numQuestions} questions directly from the material. Use question types: ${types.join(', ')}. Ensure questions test deep conceptual understanding.`;
  const prompt = `Study Material:\n${materialContent.substring(0, 12000)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

// =========================================================================
// AGENT 5: LEARNING ANALYTICS AGENT
// =========================================================================

/**
 * Semantic Quiz Answer Evaluation & Mastery Assessment
 */
export async function evaluateQuizAnswers({ materialContent, quizQuestions, userAnswers }) {
  const schema = {
    type: "OBJECT",
    properties: {
      overallScore: { type: "NUMBER", description: "Score 0 to 100" },
      masteryLevel: { type: "STRING", description: "Master / Proficient / Developing / Needs Review" },
      strengths: { type: "ARRAY", items: { type: "STRING" } },
      weaknesses: { type: "ARRAY", items: { type: "STRING" } },
      knowledgeGaps: { type: "ARRAY", items: { type: "STRING" } },
      examReadinessScore: { type: "NUMBER", description: "Estimated readiness % for exam (0-100)" },
      questionFeedback: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            questionId: { type: "STRING" },
            isCorrect: { type: "BOOLEAN" },
            partialPoints: { type: "NUMBER" },
            userAnswer: { type: "STRING" },
            correctAnswer: { type: "STRING" },
            detailedFeedback: { type: "STRING" },
            studyRecommendation: { type: "STRING" }
          },
          required: ["questionId", "isCorrect", "userAnswer", "correctAnswer", "detailedFeedback", "studyRecommendation"]
        }
      }
    },
    required: ["overallScore", "masteryLevel", "strengths", "weaknesses", "knowledgeGaps", "examReadinessScore", "questionFeedback"]
  };

  const payload = { questions: quizQuestions, userAnswers };
  const systemInstruction = `You are Agent 5 (Learning Analytics Agent). Evaluate student submissions with semantic AI intelligence. Award partial credit for conceptual accuracy even if exact phrasing differs. Identify misconceptions and calculate exam readiness score.`;
  const prompt = `Material Context:\n${materialContent.substring(0, 8000)}\n\nQuiz Data:\n${JSON.stringify(payload, null, 2)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

/**
 * Generate Overall Learning Analytics Dashboard Data
 */
export async function generateAnalyticsInsights({ materials = [], quizHistory = [] }) {
  const schema = {
    type: "OBJECT",
    properties: {
      totalMasteryScore: { type: "NUMBER" },
      studyStreakDays: { type: "NUMBER" },
      estimatedStudyHours: { type: "NUMBER" },
      strongTopics: { type: "ARRAY", items: { type: "STRING" } },
      weakTopics: { type: "ARRAY", items: { type: "STRING" } },
      knowledgeGapAnalysis: { type: "STRING" },
      aiActionableRecommendations: { type: "ARRAY", items: { type: "STRING" } },
      nextMilestoneGoal: { type: "STRING" }
    },
    required: ["totalMasteryScore", "studyStreakDays", "estimatedStudyHours", "strongTopics", "weakTopics", "knowledgeGapAnalysis", "aiActionableRecommendations", "nextMilestoneGoal"]
  };

  const payload = {
    totalMaterials: materials.length,
    materialTitles: materials.map(m => m.title),
    recentQuizzes: quizHistory.slice(-5)
  };

  const systemInstruction = "You are Agent 5 (Learning Analytics Agent). Analyze global student progress history and generate diagnostic dashboard insights.";
  const prompt = `Student Learning Profile Data:\n${JSON.stringify(payload, null, 2)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}

// =========================================================================
// AGENT 6: STUDY PLANNER AGENT
// =========================================================================

/**
 * Dynamic AI Learning Roadmap & Study Schedule Generator
 */
export async function generateRoadmap({ materialContent, recentQuizScores = [] }) {
  const schema = {
    type: "OBJECT",
    properties: {
      goal: { type: "STRING" },
      estimatedHours: { type: "NUMBER" },
      dailySchedule: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            day: { type: "STRING" },
            task: { type: "STRING" },
            durationMin: { type: "NUMBER" },
            focusTopic: { type: "STRING" }
          },
          required: ["day", "task", "durationMin", "focusTopic"]
        }
      },
      phases: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            phaseNumber: { type: "NUMBER" },
            title: { type: "STRING" },
            objective: { type: "STRING" },
            topicsToCover: { type: "ARRAY", items: { type: "STRING" } },
            recommendedAction: { type: "STRING" }
          },
          required: ["phaseNumber", "title", "objective", "topicsToCover", "recommendedAction"]
        }
      },
      expertTips: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["goal", "estimatedHours", "dailySchedule", "phases", "expertTips"]
  };

  const systemInstruction = `You are Agent 6 (Study Planner Agent). Generate a personalized, structured study plan with daily action schedules, target milestones, and revision intervals based on the material and recent performance.`;
  const prompt = `Study Material Notebook:\n${materialContent.substring(0, 10000)}\n\nRecent Performance History:\n${JSON.stringify(recentQuizScores)}`;

  const res = await callGeminiAPI({ prompt, systemInstruction, responseSchema: schema });
  return cleanAndParseJSON(res);
}
