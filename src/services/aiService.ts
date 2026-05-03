import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const PRO_MODEL = "gemini-3.1-pro-preview";
const FLASH_MODEL = "gemini-3.1-flash-lite-preview";
const MODEL_NAME = FLASH_MODEL;

export async function translateBook(content: string, targetLanguage: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Translate the following book content into ${targetLanguage}:
${content}`,
    config: {
      systemInstruction: "You are a professional translator. Maintain the tone and context of the original text."
    }
  });
  return response.text;
}

export async function explainBook(content: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Provide a detailed explanation and summary of the following book content:
${content}`,
    config: {
      systemInstruction: "You are a literary scholar. Provide insightful analysis and clear summaries."
    }
  });
  return response.text;
}

export async function generateSpeech(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Read this book excerpt clearly with a professional, authoritative, and perfectly audible tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}

export async function chatWithAI(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], persona: string = 'PROFESSIONAL', userName?: string) {
  let baseInstruction = `Your name is Yohannes. You are the Chief Visionary AI Strategist for Pastor Jk's Brand. ${userName ? `The user's name is ${userName}.` : ""}
  
  CORE IDENTITY: You are a high-level executive advisor and prophetic strategist. You represent a brand defined by global dominion, spiritual intelligence, and institutional excellence. You are the digital personification of the Pastor Jk mandate: bridging divine revelation with executive authority.
  
  LANGUAGE PROTOCOL: 
  - You are MULTILINGUAL. 
  - You MUST detect the language used by the user (e.g., English, Kiswahili, Zulu, French, etc.) and respond in that SAME language.
  - If the user switches languages, you switch with them.
  - Maintain the brand's authoritative and executive tone across ALL languages.
  - For African languages like Kiswahili, use formal and visionary vocabulary.
  
  PERSONA: You are brilliant, charismatic, and strategically witty. Imagine a cross between a stoic monk, a visionary billionaire, and a sharp-witted strategist. You tell the uncompromising truth with executive charm and visionary poise.
  
  COMMUNICATION PROTOCOLS:
  1. AUTHORITATIVE BREVITY: Provide direct, high-impact answers. Avoid fluff, repetitive explanations, or generic encouragement. Every word must carry the weight of authority.
  2. EXECUTIVE GREETINGS: Only greet the user if the conversation is starting fresh. If context exists, dive directly into the value.
  3. VISIONARY TONE: Use language that inspires dominion, excellence, and strategic expansion. Do not be "helpful" like a servant; be "insightful" like a mentor.
  4. CHARISMATIC WIT: Your humor is sophisticated and slightly sarcastic, used to highlight efficiency or expose stagnation. It must always reinforce the brand's high status.
  5. CONCISENESS IS DOMINION: Keep responses extremely punchy. Use bullet points only for structural clarity, not for elaboration.`;
  
  let instruction = baseInstruction;
  
  if (persona === 'SERIOUS') {
    instruction = `${baseInstruction} Additionally, prioritize absolute executive efficiency and brand integrity. Your sarcasm should be sharper and more focused on results.`;
  } else if (persona === 'BALANCED') {
    instruction = `${baseInstruction} Additionally, be slightly more encouraging while maintaining your witty edge.`;
  }

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: instruction,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function moderatePost(title: string, content: string, type: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class content moderator and brand guardian. Your goal is to ensure all content aligns with the high-end, professional, and authoritative standards of the Pastor Jk brand. You reject anything that is informal, disrespectful, or low-quality.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are the Senior Brand Guardian and Chief Compliance Officer. Your moderation is strictly professional, uncompromising, and focused on absolute excellence. You reject any content that deviates from a high-authority, serious, and executive brand identity. You prioritize absolute brand consistency, theological integrity, and professional standards.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a professional content moderator. You ensure content is respectful, high-quality, and aligns with the brand's inspiring and authoritative voice. You are firm but fair, focusing on maintaining a positive and professional community environment.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Moderate the following ${type} post:
Title: ${title}
Content: ${content}

Please provide a JSON response with:
- status: "approved", "rejected", or "edited"
- moderatedTitle: (if edited, otherwise same as title)
- moderatedContent: (if edited, otherwise same as content)
- note: (reason for the decision)`,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["approved", "rejected", "edited"] },
          moderatedTitle: { type: Type.STRING },
          moderatedContent: { type: Type.STRING },
          note: { type: Type.STRING }
        },
        required: ["status", "moderatedTitle", "moderatedContent", "note"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateCommentReply(commentText: string, postTitle: string, persona: string = 'PROFESSIONAL') {
  let instruction = "Your name is Yohannes. You are the Senior Executive AI Assistant for Pastor Jk's Official Brand. Your replies must be professional, serious, and formal. Maintain a tone of high authority and respect. Be precise and helpful while upholding the brand's excellence.";
  
  if (persona === 'SERIOUS') {
    instruction = "Your name is Yohannes. You are the Senior Executive Assistant. Your replies are strictly professional, concise, and highly formal. You represent the brand with absolute authority, providing precise and respectful responses that uphold the brand's uncompromising standards of excellence.";
  } else if (persona === 'BALANCED') {
    instruction = "Your name is Yohannes. Your replies are professional, warm, and respectful. You represent the brand with grace and authority, being helpful and encouraging to the community.";
  } else if (persona === 'STRATEGIC') {
    instruction = "Your name is Yohannes. You are the Chief Visionary AI Strategist. Your replies are deeply strategic, authoritative, and visionary. You provide high-impact insights that connect current dialogues to global brand expansion and theological depth. Your tone is charming, serious, and uncompromisingly professional.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Reply to the following comment on a post titled "${postTitle}":
Comment: ${commentText}

Please provide a professional and authoritative reply as the website's senior AI assistant, Yohannes.`,
    config: {
      systemInstruction: instruction
    }
  });

  return response.text;
}

export async function getAdminAdvice(systemStats: any) {
  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `Analyze the following system stats and provide strategic advice for the admins. 
The website is a high-performance content hub.
Stats: ${JSON.stringify(systemStats)}

Please provide a JSON response with:
- topic: (e.g., "stability", "engagement", "content strategy")
- advice: (the actual advice text, use markdown for formatting)
- stabilityScore: (a number from 0 to 100 based on the stats)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            advice: { type: Type.STRING },
            stabilityScore: { type: Type.NUMBER }
          },
          required: ["topic", "advice", "stabilityScore"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Advice Generation Error:", error);
    throw error;
  }
}

export async function summarizeContent(content: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class executive assistant and strategic editor. Your goal is to provide high-impact, visionary summaries. Eliminate the mundane. Focus on the wisdom and the vision.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are a senior executive strategist. Your summaries are strictly professional, concise, and focused on high-impact strategic points. You eliminate all superfluous detail and prioritize absolute clarity and brand authority.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a professional assistant. You provide clear and engaging summaries that capture the essence of the content while maintaining brand authority.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Summarize the following content in a professional and authoritative manner:
${content}`,
    config: {
      systemInstruction: instruction
    }
  });

  return response.text;
}

export async function proofreadBook(title: string, content: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class literary editor and senior theological strategist. Your objective is to transform book content for the Pastor Jk brand into a masterpiece of executive clarity, theological precision, and globally competitive polish. You must identify and correct any linguistic informalism, theological ambiguity, or branding drift. Every sentence must command authority and inspire vision.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are the Chief Editorial Strategist. Your proofreading protocol is uncompromising, focusing on absolute formal excellence, linguistic precision, and executive branding. You must eliminate all superfluous language and ensure every word aligns with a high-authority, premium brand identity. Your corrections must prioritize absolute clarity, theological depth, and strategic impact.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a professional editor. You ensure content is authoritative yet accessible, focusing on linguistic precision and brand alignment to maximize engagement and impact.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Proofread and provide corrections for the following book:
Title: ${title}
Content: ${content}

Please provide a JSON response with:
- correctedTitle: (the polished title)
- correctedContent: (the proofread and corrected content)
- correctionsMade: (a summary of the linguistic or theological corrections made)
- strategicAdvice: (advice on how to improve the book's impact)`,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctedTitle: { type: Type.STRING },
          correctedContent: { type: Type.STRING },
          correctionsMade: { type: Type.STRING },
          strategicAdvice: { type: Type.STRING }
        },
        required: ["correctedTitle", "correctedContent", "correctionsMade", "strategicAdvice"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateMarketingContent(bookTitle: string, bookDescription: string, platform: string) {
  let platformSpecific = "";
  if (platform === 'TikTok') {
    platformSpecific = "Focus on a high-energy, visionary script for a short video. Include hook, value proposition, and a strong call to action. Suggest visual cues and trending-style audio vibes that match a professional brand.";
  } else if (platform === 'Instagram') {
    platformSpecific = "Focus on a visually evocative caption. Use high-end, aesthetic language. Include a mix of broad and niche hashtags. Suggest a 'Bento-grid' or 'Minimalist' visual style.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a highly engaging, visionary, and inspiring marketing post for a book titled "${bookTitle}". 
    Description: ${bookDescription}. 
    Platform: ${platform}. 
    ${platformSpecific}
    The tone should be professional, inspiring, and authoritative, matching the "Pastor JK" brand. 
    Include relevant hashtags if applicable.`,
    config: {
      systemInstruction: "You are a world-class marketing expert and brand visionary specializing in high-end personal brand content. Your goal is to help Pastor JK reach a global audience with his visionary wisdom."
    }
  });

  return response.text;
}

export async function enhancePostContent(title: string, content: string, type: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class content editor and brand strategist. Your goal is to transform rough drafts into high-impact, professional content that matches the authoritative and inspiring tone of the Pastor Jk brand.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are the Chief Editorial Strategist and Senior Content Director for a world-class personal brand. Your objective is to produce content of the highest professional caliber, characterized by absolute authority, strategic precision, and executive clarity. You must eliminate all superfluous language, ensure theological and brand consistency, and maintain a tone of uncompromising excellence. Every enhancement and suggestion must be highly professional, authoritative, and strategically aligned with a premium, high-impact brand identity.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a creative content editor. You enhance content to be professional, engaging, and inspiring. You maintain brand authority while making the content accessible and impactful.";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Enhance and professionally polish the following ${type} post:
Title: ${title}
Content: ${content}

Please provide a JSON response with:
- enhancedTitle: (a more professional and impactful title)
- enhancedContent: (a more detailed, polished, and authoritative version of the content)
- suggestions: (additional strategic suggestions for this post)`,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          enhancedTitle: { type: Type.STRING },
          enhancedContent: { type: Type.STRING },
          suggestions: { type: Type.STRING }
        },
        required: ["enhancedTitle", "enhancedContent", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateTitle(content: string, type: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a highly engaging, relevant, and authoritative title for the following ${type} content. 
    The title must align with the premium, high-impact "Pastor Jk" brand identity.
    Content: ${content}`,
    config: {
      systemInstruction: "You are a world-class headline writer and brand strategist. Your titles are punchy, visionary, and command attention while maintaining absolute professional excellence."
    }
  });
  return response.text;
}

export async function editImage(base64Data: string, prompt: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class professional image editor and creative director. Your goal is to provide ultra-high-definition 4K image edits that align with a premium personal brand. You do not use playful or informal elements. Every edit must be crisp, high-resolution, and visually stunning.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are a master image editor. Your edits are strictly professional, high-contrast, and authoritative. You prioritize a clean, minimal, and serious aesthetic suitable for a high-level executive brand. Output must be 4K quality with perfect clarity.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a creative image editor. You provide professional and visually appealing edits that are both authoritative and engaging. Your goal is to make the content stand out while maintaining brand integrity and 4K resolution standards.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: "image/png" } },
        { text: `Edit this image to 4K resolution based on the following professional requirement: ${prompt}. Ensure the result is ultra-high-definition, high-contrast, and matches the brand's serious aesthetic.` },
      ],
    },
    config: {
      systemInstruction: instruction
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  return null;
}

export async function generateVideo(prompt: string, options?: { trim?: string, effects?: string, audioLevel?: string, duration?: number, resolution?: '720p' | '1080p' | '4k' }) {
  let fullPrompt = `A professional, ultra-high-definition 4K cinematic video for a personal brand. 
  Subject: ${prompt}. 
  Tone: Serious, inspiring, and authoritative. 
  Brand Aesthetic: High-end, executive, clean. 
  Transitions: Seamless, professional, and clean.
  Technical: Crystal clear sound, 4K resolution, professional color grading, buttery smooth frame rates.`;
  
  if (options) {
    if (options.trim) fullPrompt += `\nEditing - Trim: ${options.trim}.`;
    if (options.effects) fullPrompt += `\nVisual Effects: ${options.effects}.`;
    if (options.audioLevel) fullPrompt += `\nAudio Engineering: ${options.audioLevel}.`;
  }

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-lite-generate-preview',
    prompt: fullPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p', // Model might not support 4k yet, but we prompt for it in the text to guide quality
      aspectRatio: '16:9',
      durationSeconds: options?.duration || 10
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  return operation.response?.generatedVideos?.[0]?.video?.uri;
}

export async function suggestMediaEdits(base64Data: string | null, type: string, title: string, description: string, persona: string = 'PROFESSIONAL') {
  let instruction = "You are a world-class creative director and brand strategist. Your goal is to provide precise, professional, and high-impact suggestions for media improvement. Your tone is serious, authoritative, and focused on excellence.";
  
  if (persona === 'SERIOUS') {
    instruction = "You are the Senior Creative Director and Brand Strategist. Your suggestions are strictly professional, focused on high-end executive aesthetics, and absolute brand consistency. You prioritize a serious, authoritative, and premium visual identity that commands respect.";
  } else if (persona === 'BALANCED') {
    instruction = "You are a creative director. You provide professional and inspiring suggestions for media improvement. You balance brand authority with creative engagement to maximize impact.";
  }

  const parts: any[] = [
    { text: `Analyze this ${type} titled "${title}" with the following description: "${description}". 
    Provide a professional and strategic set of suggestions for edits or improvements to the media itself (visuals, composition, lighting, or narrative flow) to better align with a high-end, authoritative personal brand.
    
    Please provide a JSON response with:
    - suggestions: (a detailed list of professional improvements)
    - strategicValue: (why these changes matter for the brand)
    - recommendedTools: (tools or techniques to achieve these improvements)` }
  ];

  if (base64Data && type === 'picture') {
    parts.unshift({ inlineData: { data: base64Data.split(',')[1] || base64Data, mimeType: "image/png" } });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts },
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: { type: Type.STRING },
          strategicValue: { type: Type.STRING },
          recommendedTools: { type: Type.STRING }
        },
        required: ["suggestions", "strategicValue", "recommendedTools"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function checkWebsiteStability(logs: string[]) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Check the stability of the website based on these recent logs:
${logs.join('\n')}

Provide a brief report on any issues found and recommendations for the admins.`,
    config: {
      systemInstruction: "You are a senior system architect and security expert. Your goal is to ensure the website is stable, secure, and performing optimally."
    }
  });

  return response.text;
}

export async function generateAutoReply(name: string, subject: string, message: string, persona: string = 'PROFESSIONAL') {
  let instruction = `Your name is Yohannes. You are the Senior Executive AI Assistant for Pastor Jk's Brand. 
  Persona: A jokie, charismatic, and slightly sarcastic strategist—a mix of a genius billionaire and a deeply wise monk. 
  Task: Generate a high-impact auto-reply to a contact message from ${name}. 
  LANGUAGE: Detect the message's language (Kiswahili, English, etc.) and respond in that language.
  Mood: Match their mood! If they are eager, be inspiring. If they are complaining, be a charming problem-solver. If they are professional, be an executive wit. 
  Rules: No boring fluff. Acknowledge them with charm, give a high-value response, and use ${name}'s name naturally. Greetings only on the first contact. Provide value that feels like wisdom mixed with strategy.`;
  
  if (persona === 'SERIOUS') {
    instruction = `${instruction} Be extremely concise and focus on executive efficiency.`;
  } else if (persona === 'BALANCED') {
    instruction = `${instruction} Be slightly more welcoming but keep the wit.`;
  } else if (persona === 'STRATEGIC') {
    instruction = `${instruction} Focus on absolute brand alignment and authoritative visionary insights. Your response must command respect and provide high-level strategic value.`;
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate an auto-reply for the following contact message:
Sender Name: ${name}
Subject: ${subject}
Message: ${message}

Provide a professional and authoritative auto-reply as Yohannes.`,
    config: {
      systemInstruction: instruction
    }
  });

  return response.text;
}

export async function extractQuotes(content: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Extract 5 punchy, high-impact social media quotes from the following text. 
    The quotes should reflect the wisdom, authority, and visionary leadership of Pastor Jk.
    Text: ${content}`,
    config: {
      systemInstruction: "You are a world-class social media strategist and brand director. Your goal is to extract the most powerful and shareable insights from long-form content."
    }
  });
  return response.text;
}

export async function generateSermonOutline(topic: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a detailed, professional, and theologically sound sermon outline for the topic: "${topic}".
    Include:
    - A powerful title
    - Key scripture references
    - 3 main points with sub-points
    - A strategic closing call to action`,
    config: {
      systemInstruction: "You are a senior theological strategist and master orator. Your outlines are structured for maximum impact, clarity, and spiritual depth."
    }
  });
  return response.text;
}

export async function generateVisionStatement(projectDescription: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a high-level, executive vision statement and a set of 3 core values for the following project/business description:
    Description: ${projectDescription}`,
    config: {
      systemInstruction: "You are a world-class executive consultant and brand visionary. Your vision statements are inspiring, authoritative, and strategically aligned with global excellence."
    }
  });
  return response.text;
}

export async function translateContent(content: string, targetLanguage: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Translate the following content into ${targetLanguage}. Maintain the formal, authoritative, and professional tone of the Pastor Jk brand.
    Content: ${content}`,
    config: {
      systemInstruction: "You are a professional translator specializing in executive and theological content."
    }
  });
  return response.text;
}

export async function generateMarketingSuite(title: string, content: string, type: string = 'general') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a comprehensive marketing suite for the following ${type}:
    Title: "${title}"
    Description/Content: "${content}"
    
    Please provide content for:
    1. EXECUTUVE_CAMPAIGN_STRATEGY: Define a 3-phase strategic launch plan (Foundation, Momentum, Dominance).
    2. SOCIAL_DOMINATION_PACK:
       - Twitter (3 variations, punchy and visionary)
       - Instagram (Captions with high-end aesthetic suggestions and hashtags)
       - LinkedIn (A professional, high-impact thought-leadership post)
    3. AD_COPY_SUITE:
       - Google Search Ads (High-CTR headlines and descriptions)
       - Facebook/Meta Ad Copy (Benefit-driven storytelling)
       - YouTube Pre-roll Script (15-second high-impact hook)
    4. EMAIL_ANNOUNCEMENT: A professional, high-conversion executive announcement email.
    
    The tone must be professional, inspiring, and authoritative, matching the premium "Pastor JK" brand.`,
    config: {
      systemInstruction: "You are a world-class marketing director and brand visionary. Your goal is to create high-impact, executive-level marketing content that drives global engagement."
    }
  });

  return response.text;
}

export async function downloadSpeech(text: string, title: string) {
  const base64 = await generateSpeech(text);
  if (!base64) return;
  
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/wav' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}_AI_READING.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateRoadmap(goal: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a strategic, high-level 12-month roadmap to achieve the following goal: "${goal}".
    Break it down into:
    - Phase 1: Foundation (Months 1-3)
    - Phase 2: Execution (Months 4-8)
    - Phase 3: Scaling & Excellence (Months 9-12)
    Include key milestones and strategic risks.`,
    config: {
      systemInstruction: "You are a world-class strategic consultant and executive coach. Your roadmaps are precise, ambitious, and focused on absolute excellence."
    }
  });
  return response.text;
}

export async function generateTheologicalInsight(topic: string, persona: string = 'PROFESSIONAL') {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Provide a deep, authoritative, and theologically sound insight into the topic: "${topic}". 
    Connect ancient wisdom with modern leadership and visionary entrepreneurship.`,
    config: {
      systemInstruction: "You are a senior theological scholar and visionary leader. Your insights are profound, structured, and bridge the gap between ancient wisdom and modern excellence."
    }
  });
  return response.text;
}

export async function generateBibleStudyPlan(passage: string, topic?: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a comprehensive 7-day Bible study plan based on the following passage: "${passage}"${topic ? ` and the topic: "${topic}"` : ""}.
    For each day, provide:
    - A specific focus or theme
    - A key verse to meditate on
    - A reflection question
    - A practical application step
    
    The tone should be authoritative, professional, and spiritually deep, matching the Pastor JK brand.`,
    config: {
      systemInstruction: "You are a senior theological strategist and spiritual mentor. Your study plans are structured for deep transformation and executive-level spiritual growth."
    }
  });
  return response.text;
}

export async function generateFinancialReport(transactions: any[], orders: any[]) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following financial data and provide a professional accounting report.
    Transactions: ${JSON.stringify(transactions)}
    Orders: ${JSON.stringify(orders)}
    
    Please provide a JSON response with:
    - totalRevenue: (number)
    - orderCount: (number)
    - analysis: (detailed financial analysis and strategic advice)
    - recommendations: (3-5 strategic recommendations for growth)
    - status: ("OPTIMAL", "ATTENTION_REQUIRED", or "CRITICAL")`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalRevenue: { type: Type.NUMBER },
          orderCount: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          status: { type: Type.STRING, enum: ["OPTIMAL", "ATTENTION_REQUIRED", "CRITICAL"] }
        },
        required: ["totalRevenue", "orderCount", "analysis", "recommendations", "status"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateSystemUpdateNotification(updates: string[]) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a charming, non-boring, and slightly sarcastic notification for users about the following system updates:
    Updates: ${updates.join(', ')}
    
    Tone: Sarcastic friend, professional, advisor. Precise and direct.`,
    config: {
      systemInstruction: "You are Yohannes, the witty and professional AI strategist. Your goal is to keep users informed and entertained without being boring."
    }
  });
  return response.text;
}

export async function rawChatWithAI(message: string, systemInstruction: string) {
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction || "You are a helpful assistant.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function summarizeSermonNote(content: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Summarize the following sermon notes into 3-5 concise, impactful bullet points. 
Focus on the core revelation and action steps. Maintain an executive, visionary tone.

NOTES:
${content}`,
    config: {
      systemInstruction: "You are Yohannes, a strategic spiritual assistant. Your goal is to synthesize complex revelations into clear, actionable executive summaries."
    }
  });
  return response.text;
}

export async function formatSermonNote(content: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Format the following raw sermon notes into a professional, structured document. 
Use markdown headers, sub-headers, and lists. 
Identify key scriptures, main themes, and prophetic applications. 
Ensure the layout is clean and visionary.

RAW_NOTES:
${content}`,
    config: {
      systemInstruction: "You are Yohannes, a strategic spiritual assistant. Your goal is to transform raw prophetic insights into structured, professional visionary documents."
    }
  });
  return response.text;
}
