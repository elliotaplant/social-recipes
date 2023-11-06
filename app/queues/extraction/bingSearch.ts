const BING_SEARCH_ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search';

interface BingSearchResult {
  id: string;
  name: string;
  url: string;
  datePublished: string;
  datePublishedDisplayText: string;
  isFamilyFriendly: boolean;
  displayUrl: string;
  snippet: string;
  dateLastCrawled: string;
  cachedPageUrl: string;
  language: string;
  isNavigational: boolean;
}

export async function queryBingSearchApi(query: string): Promise<BingSearchResult | null> {
  if (!process.env.BING_API_KEY) {
    throw new Error('BING_API_KEY is a required env variable');
  }

  try {
    const response = await fetch(`${BING_SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&count=1`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Bing search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.webPages.value[0];
    console.log('Got search result', result);
    return result;
  } catch (error) {
    console.error('Error searching Bing:', error);
    throw error;
  }
}
