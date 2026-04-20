import axios from "axios"

export const askAi = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        const axiosInstance = axios.create({
            timeout: 25000, // 25 second timeout (well before Render's 31-second limit)
        });

        const response = await axiosInstance.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response.");
        }

        return content;
    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        
        // More descriptive error messages
        if (error.code === "ECONNABORTED") {
            throw new Error("OpenRouter API request timeout - took too long to respond");
        }
        if (error.response?.status === 429) {
            throw new Error("OpenRouter API rate limited - too many requests");
        }
        if (error.response?.status === 401) {
            throw new Error("OpenRouter API authentication failed - invalid API key");
        }
        
        throw new Error("OpenRouter API Error: " + error.message);
    }
}