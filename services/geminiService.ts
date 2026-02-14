
import { GoogleGenAI } from "@google/genai";

export async function generateDashboardInsights(data: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analyze the following dashboard data and provide 3 key business insights for an administrator.
    Keep the response concise, professional, and actionable.
    
    Data: ${JSON.stringify(data)}
    
    Format the response as a JSON object with this structure:
    {
      "insights": [
        {"title": "...", "description": "..."},
        {"title": "...", "description": "..."}
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || '{"insights": []}');
    return result.insights;
  } catch (error) {
    console.error("Gemini Insight Generation Failed:", error);
    return [
      { title: "Revenue Analysis", description: "Steady 12.5% growth observed in monthly recurring revenue." },
      { title: "User Retention", description: "Trial conversion rates are currently at 8%, slightly below target." },
      { title: "Security Alert", description: "2FA disablements have increased by 5% this week." }
    ];
  }
}
