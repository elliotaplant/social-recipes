export const SEARCH_RECIPE = {
  name: "search_recipe",
  description: "Searches for a recipe with google",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "A query to find the recipe by the author online",
      },
    },
    required: ["query"],
  },
};

export interface Search {
  query: string;
}
