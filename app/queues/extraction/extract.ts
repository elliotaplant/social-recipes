import { queryBingSearchApi } from "./bingSearch";
import { getRecipeFromBlog } from "./blog";
import { getPostInfo, getUserBio, isValidInstagramUrl } from "./instagram";
import { resolveBlogPage, resolveInstaPost } from "./openai";
import { ExtractedRecipe } from "./schema/save_recipe";

export async function extract(postUrl: string): Promise<{
  username: string;
  recipe?: ExtractedRecipe;
  failureReason?: string;
  blogUrl?: string;
  query?: string;
}> {
  if (!isValidInstagramUrl(postUrl)) {
    throw new Error("Invalid instagram post URL");
  }

  const { description, username } = await getPostInfo(postUrl);
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
    return { recipe, username };
  }

  let blogUrl: string | undefined = instagramResult.extract?.url;
  let blogContent: string | undefined;
  let query: string | undefined;

  if (blogUrl) {
    console.log("Getting blog content from url");
    blogContent = await getRecipeFromBlog(blogUrl);
  } else if (instagramResult.search) {
    console.log("Searching for blog content");
    query = instagramResult.search.query;
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
      return { recipe: blogResult.recipe, username, blogUrl, query };
    } else if (blogResult?.report) {
      console.log("could not find recipe:", blogResult.report.cause);
      return {
        failureReason: blogResult.report.cause,
        username,
        blogUrl,
        query,
      };
    }
  }

  return {
    username,
    blogUrl,
    query,
    failureReason: "No blog content found",
  };
}
