import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

import { EXTRACT_RECIPE, Extract } from "./schema/extract_recipe";
import {
  MissingReport,
  REPORT_MISSING_RECIPE,
} from "./schema/report_missing_recipe";
import { ExtractedRecipe, SAVE_RECIPE } from "./schema/save_recipe";
import { SEARCH_RECIPE, Search } from "./schema/search_recipe";

const openai = new OpenAI();

export async function resolveInstaPost(
  username: string,
  postContent: string,
  bio: string,
  external_url: string | undefined,
): Promise<{
  recipe?: ExtractedRecipe;
  search?: Search;
  extract?: Extract;
} | null> {
  const functions = [SAVE_RECIPE, EXTRACT_RECIPE, SEARCH_RECIPE];

  const prompt = `Here is an instagram post comment from user ${username}:
"""
${postContent}
"""

Here is that user's bio:

"""
${bio}
"""
${
  external_url
    ? `
Here is the user's "external URL": ${external_url}
`
    : ""
}
If the post contains a complete recipe, please save the recipe for me.
Else, if the post contains a recipe URL, please extract the recipe from the url.
Else, search for the recipe online.`;

  console.log("Instagram resolver prompt", prompt);

  const messages: ChatCompletionMessageParam[] = [
    { role: "user", content: prompt },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4", // 'gpt-3.5-turbo'
    // model: 'gpt-3.5-turbo',
    messages,
    functions,
    function_call: "auto",
  });

  console.log("response.choices[0].message", response.choices[0].message);

  const call = response.choices[0].message?.function_call;
  if (call && call.arguments) {
    // TODO: resolve types better here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let args: any;
    try {
      args = JSON.parse(call.arguments);
    } catch (error) {
      throw new Error(
        `Unable to parse function call arguments: ${JSON.stringify(call)}`,
      );
    }

    switch (call.name) {
      case SAVE_RECIPE.name:
        console.log("Found recipe", args);
        return { recipe: args };
      case EXTRACT_RECIPE.name:
        console.log("Found recipe url", args);
        return { extract: args };
      case SEARCH_RECIPE.name:
        console.log("Searching for", args);
        return { search: args };
      default:
        console.log(`Unknown function call: ${call.name}`);
        break;
    }
  }
  return null;
}

export async function resolveBlogPage(
  blogContent: string,
): Promise<{ recipe?: ExtractedRecipe; report?: MissingReport } | null> {
  const functions = [SAVE_RECIPE, REPORT_MISSING_RECIPE];

  const prompt = `Here is the content of a web page:
"""
${blogContent}
"""

If it contains a complete recipe, save the recipe for me. 
If the recipe isn't complete, report the recipe missing.
`;

  console.log("Blog post resolver prompt:", prompt);

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4", // 'gpt-3.5-turbo'
    messages,
    functions,
    function_call: "auto",
  });

  console.log("response.choices[0].message", response.choices[0].message);

  const call = response.choices[0].message?.function_call;
  if (call && call.arguments) {
    // TODO: resolve types better here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let args: any;
    try {
      args = JSON.parse(call.arguments);
    } catch (error) {
      throw new Error(
        `Unable to parse function call arguments: ${JSON.stringify(call)}`,
      );
    }

    switch (call.name) {
      case SAVE_RECIPE.name:
        console.log("Found recipe", args);
        return { recipe: args };
      case REPORT_MISSING_RECIPE.name:
        console.log("Could not find recipe", args);
        return { report: args };
      default:
        console.log(`Unknown function call: ${call.name}`);
        break;
    }
  }
  return null;
}
