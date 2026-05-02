import { useStore } from './useStore';

/**
 * Hook for calling AI services with configurable settings.
 */
export function useAI() {
  const { aiSettings } = useStore();

  /**
   * Generic helper for calling an OpenAI-compatible API.
   */
  async function callAI(
    messages: { role: string; content: string }[],
    temperature = 0.7,
  ) {
    const { baseUrl, model, apiKey } = aiSettings;
    
    // Normalize base URL to ensure it ends with /chat/completions
    let url = baseUrl.trim();
    if (!url.endsWith('/chat/completions')) {
      url = `${url.replace(/\/$/, '')}/chat/completions`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `AI Request failed: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorMessage;
        } catch (e) {
          // Use default error message if JSON parsing fails
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI API Error:", error);
      throw error;
    }
  }

  /**
   * Attempts to parse a JSON array or object from a string that might contain markdown blocks.
   */
  function parseAIJson<T>(content: string): T | null {
    try {
      const jsonMatch = content.match(/(\{.*\}|\[.*\])/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", content);
      return null;
    }
  }

  // --- AI Features ---

  /**
   * Calls AI with raw input and returns the response text.
   */
  async function fetchRawAIResponse(input: string): Promise<string> {
    return callAI([
      {
        role: "user",
        content: input,
      },
    ]);
  }

  /**
   * Legacy wrapper for task expansion (raw text version).
   */
  async function fetchTaskExpansionText(input: string): Promise<string> {
    return fetchRawAIResponse(input);
  }

  /**
   * Calls AI for task expansion and parses bullet points.
   */
  async function fetchTaskExpansion(input: string): Promise<string[]> {
    const content = await fetchRawAIResponse(input);

    // Parse bullet points
    const tasks = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);

    if (tasks.length === 0) {
      const jsonTasks = parseAIJson<string[]>(content);
      if (Array.isArray(jsonTasks)) {
        return jsonTasks.filter((t) => typeof t === "string");
      }
      throw new Error("INVALID_FORMAT");
    }

    return tasks;
  }

  /**
   * Calls AI for a briefing/information.
   */
  async function fetchTaskBriefing(input: string): Promise<string> {
    return fetchRawAIResponse(input);
  }

  return {
    fetchRawAIResponse,
    fetchTaskExpansionText,
    fetchTaskExpansion,
    fetchTaskBriefing,
  };
}
