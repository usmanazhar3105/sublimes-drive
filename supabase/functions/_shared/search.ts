// Web search provider for Freya AI
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function searchWeb(query: string, limit = 3): Promise<SearchResult[]> {
  const provider = Deno.env.get('SEARCH_API_PROVIDER') || 'bing';
  const apiKey = Deno.env.get('SEARCH_API_KEY');

  if (!apiKey) {
    console.warn('SEARCH_API_KEY not configured, skipping web search');
    return [];
  }

  try {
    if (provider === 'bing') {
      const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${limit}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return (data.webPages?.value || []).map((r: any) => ({
        title: r.name,
        url: r.url,
        snippet: r.snippet,
      }));
    }

    // Add other providers (tavily, serpapi) here
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
