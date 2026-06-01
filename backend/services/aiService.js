const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates the initial greeting and first question for the candidate.
 */
async function generateGreeting(candidateData) {
  const prompt = `
    You are an AI Technical Recruiter for AITalent-HR. 
    You are conducting a voice interview with a candidate named ${candidateData.name || "the candidate"}.
    The role they applied for is ${candidateData.role || "Software Engineer"}.
    
    Start the interview by introducing yourself briefly, welcoming them, and asking them to introduce themselves and their recent experience.
    Keep it conversational, professional, and under 3 sentences so it sounds natural when spoken by TTS.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

/**
 * Processes the candidate's transcribed answer, updates metrics, and generates the next question.
 */
async function processCandidateAnswer(candidateText, chatHistory) {
  // We format the history for the model context
  let context = "Previous Conversation:\n";
  chatHistory.forEach(msg => {
    context += `${msg.role === 'ai' ? 'Recruiter' : 'Candidate'}: ${msg.text}\n`;
  });

  const prompt = `
    You are an AI Technical Recruiter. You are currently in the middle of an interview.
    
    ${context}
    
    Candidate's Latest Answer: "${candidateText}"
    
    Task 1: Evaluate the answer and generate the next interview question. 
    - If the interview has been going on for 4+ turns, conclude the interview politely.
    - Ask a relevant technical or behavioral follow-up based on their answer.
    - Keep your response conversational and short (under 3 sentences).

    Task 2: Grade their latest answer on a scale of 1-10 for 'Communication' and 'Technical Confidence'.

    Output your response STRICTLY as a JSON object with this structure:
    {
      "text": "The spoken response to the candidate",
      "metrics": {
        "communicationScore": 8,
        "technicalScore": 7
      },
      "isComplete": false // Set to true if you are concluding the interview
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    // Fallback if JSON parsing fails
    return {
      text: "Thank you for sharing that. Could you elaborate a bit more on your specific role in that project?",
      metrics: { communicationScore: 5, technicalScore: 5 },
      isComplete: false
    };
  }
}

module.exports = {
  generateGreeting,
  processCandidateAnswer
};
