import { queryBingSearchApi } from "./bingSearch";
import { getRecipeFromBlog } from "./blog";
import {
  getPostInfo,
  getUserBio,
  isValidInstagramUrl,
  isValidUrl,
} from "./instagram";
import { resolveBlogPage, resolveInstaPost } from "./openai";
import { ExtractedRecipe } from "./schema/save_recipe";

export async function extract(recipeUrl: string): Promise<{
  username?: string;
  recipe?: ExtractedRecipe;
  failureReason?: string;
  blogUrl?: string;
  query?: string;
  instagramPostUrl?: string;
}> {
  const isInstagramPost = isValidInstagramUrl(recipeUrl);
  const isBlogRecipe = isValidUrl(recipeUrl);
  if (!(isInstagramPost || isBlogRecipe)) {
    throw new Error(
      "Recipe URL is neither a valid instagram post or a recipe blog URL",
    );
  }

  let blogUrl: string | undefined;
  let blogContent: string | undefined;
  let query: string | undefined;
  let instagramPosterUsername: string | undefined;
  let instagramPostUrl: string | undefined;

  if (isInstagramPost) {
    instagramPostUrl = recipeUrl;
    const { description, username } = await getPostInfo(recipeUrl);
    const { biography, external_url } = await getUserBio(username);

    console.log(
      "Data from instagram post",
      JSON.stringify({ username, biography, external_url, description }),
    );

    // Get the recipe response from the description
    const instagramResult = await resolveInstaPost(
      username,
      description,
      biography,
      external_url,
    );

    if (!instagramResult) {
      console.log("Unable to figure out next action");
      return {
        username,
        failureReason: "Unable to get results from instagram post",
      };
    }

    const recipe = instagramResult.recipe;

    if (recipe) {
      return { recipe, username, instagramPostUrl };
    } else {
      blogUrl = instagramResult.extract?.url;
      query = instagramResult.search?.query;
      query = instagramResult.search?.query;
      instagramPosterUsername = username;
    }
  } else {
    blogUrl = recipeUrl;
  }

  if (blogUrl) {
    console.log("Getting blog content from url");
    blogContent = await getRecipeFromBlog(blogUrl);
  } else if (query) {
    console.log("Searching for blog content");
    const searchResult = await queryBingSearchApi(query);
    if (searchResult && searchResult.url) {
      blogUrl = searchResult.url;
      console.log("Getting blog content from search result");
      blogContent = await getRecipeFromBlog(searchResult.url);
    }
  }

  if (blogContent) {
    const blogResult = await resolveBlogPage(blogContent);
    if (blogResult?.recipe) {
      return {
        recipe: blogResult.recipe,
        username: instagramPosterUsername,
        instagramPostUrl,
        blogUrl,
        query,
      };
    } else if (blogResult?.report) {
      console.log("could not find recipe:", blogResult.report.cause);
      return {
        failureReason: blogResult.report.cause,
        username: instagramPosterUsername,
        instagramPostUrl,
        blogUrl,
        query,
      };
    }
  }

  return {
    username: instagramPosterUsername,
    instagramPostUrl,
    blogUrl,
    query,
    failureReason: "No blog content found",
  };
}
