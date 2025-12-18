
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export async function restorePhoto(base64Image: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Note: Gemini-2.5-flash-image is used for image tasks
  const prompt = `
    This is an old, vintage, possibly damaged photograph. 
    Please restore it professionally:
    1. Fix scratches, dust, and physical damage.
    2. Enhance the resolution and sharpen blurry details.
    3. Colorize the image naturally if it is black and white, or improve existing color balance.
    4. Maintain the historical integrity and facial likeness perfectly.
    5. Output the final restored high-quality image.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
          { text: prompt }
        ]
      },
    });

    let restoredImageBase64 = null;
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          restoredImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return restoredImageBase64;
  } catch (error) {
    console.error("Gemini Restoration Error:", error);
    return null;
  }
}
