const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const cx = process.env.GOOGLE_SEARCH_CX;

interface SearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
}

export async function queryGoogleSearchApi(query: string): Promise<SearchResult | null> {
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodedQuery}&num=1`;
  console.log('endpoint', endpoint);

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error from Google Search API: ${response.status} - ${JSON.stringify(data)}`);
    }
    if (data.items && data.items.length > 0) {
      console.log('Search result', data.items[0]);
      return data.items[0];
    } else {
      console.log('No results found.');
    }
  } catch (error) {
    console.error('Failed to query the Google Search API:', error);
  }
  return null;
}
