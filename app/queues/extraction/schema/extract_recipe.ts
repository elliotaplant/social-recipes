export const EXTRACT_RECIPE = {
  name: "extract_recipe",
  description: "Extracts a recipe from a recipe URL",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The url of the recipe site",
      },
    },
    required: ["url"],
  },
};

export interface Extract {
  url: string;
}
