import { useStore } from './useStore';

export function useAI() {
  const { aiSettings } = useStore();

  async function callAI(
    messages: { role: string; content: string }[],
    temperature = 0.7,
  ) {
    const { baseUrl, model, apiKey } = aiSettings;
    
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
        throw new Error(`AI Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI API Error:", error);
      throw error;
    }
  }

  async function fetchRawAIResponse(input: string): Promise<string> {
    return callAI([{ role: "user", content: input }]);
  }

  async function fetchTaskExpansion(input: string): Promise<string[]> {
    const content = await fetchRawAIResponse(input);
    const tasks = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);

    return tasks;
  }

  return {
    fetchRawAIResponse,
    fetchTaskExpansion,
  };
}
