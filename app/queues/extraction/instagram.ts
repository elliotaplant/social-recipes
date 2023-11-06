export async function getPostInfo(
  postUrl: string,
): Promise<{ description: string; username: string }> {
  // Fetch the page content with query params to get JSON graphql response
  const jsonURL = postUrl + "?__a=1&__d=dis";
  const response = await fetch(jsonURL);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch ${jsonURL}: ${response.statusText}`);
  }

  // Load the page content
  const responseJson = await response.json();

  // Pluck the description from the json response
  return {
    description:
      responseJson.graphql?.shortcode_media?.edge_media_to_caption?.edges?.at(0)
        ?.node?.text,
    username: responseJson.graphql?.shortcode_media?.owner?.username,
  };
}

export async function getUserBio(
  username: string,
): Promise<{ biography: string; external_url: string | undefined }> {
  // Fetch the page content with query params to get JSON graphql response
  const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
  const response = await fetch(url);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  // Load the page content
  const responseJson = await response.json();

  // Pluck the description from the json response
  const biography = responseJson.graphql?.user?.biography;
  const external_url = responseJson.graphql?.user?.external_url;
  return { biography, external_url };
}

export function isValidInstagramUrl(url: string): boolean {
  const regex = /^https:\/\/www\.instagram\.com\/p\/[\w_-]+\/$/;
  return regex.test(url);
}
