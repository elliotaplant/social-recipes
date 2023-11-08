import { INSTACOOKIE_REDIS_KEY } from "~/routes/instacookies";
import { redis } from "~/utils/redis.server";

async function instagramCookie() {
  const instacookie = await redis.get(INSTACOOKIE_REDIS_KEY);
  if (!instacookie) {
    throw new Error("Instacookie not present. Set it in the UI");
  }
  return {
    cookie: instacookie,
    "sec-ch-ua":
      '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
  };
}

export async function getPostInfo(
  postUrl: string,
): Promise<{ description: string; username: string }> {
  // Fetch the page content with query params to get JSON graphql response
  const jsonURL = postUrl + "?__a=1&__d=dis";
  const headers = await instagramCookie();
  const response = await fetch(jsonURL, { headers });

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch ${jsonURL}: ${response.statusText}`);
  }

  // Load the page content
  const responseJson = await response.json();

  // Pluck the description and username from the json response
  let description =
    responseJson.graphql?.shortcode_media?.edge_media_to_caption?.edges?.at(0)
      ?.node?.text;

  if (!description) {
    description = responseJson.items?.at(0)?.caption?.text;
  }

  let username = responseJson.graphql?.shortcode_media?.owner?.username;

  if (!username) {
    username = responseJson.items?.at(0)?.user?.username;
  }

  return { description, username };
}

export async function getUserBio(
  username: string,
): Promise<{ biography: string; external_url: string | undefined }> {
  // Fetch the page content with query params to get JSON graphql response
  const jsonURL = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
  const headers = await instagramCookie();
  const response = await fetch(jsonURL, { headers });

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch ${jsonURL}: ${response.statusText}`);
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

export function isValidUrl(url: string): boolean {
  const regex = /^(https?:\/\/)([\w.-]+)(\.[\w.-]+)(\/.+)$/;
  return regex.test(url);
}
