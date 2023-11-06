export const SAVE_RECIPE = {
  name: "save_recipe",
  description: "Formats and saves a recipe for the user",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name or title of the recipe",
      },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            unit: {
              type: "string",
              description:
                "The unit of measurement for the item. e.g. Tbsp or Apple",
            },
            quantity: {
              type: "number",
              description: "The amount of units required by the recipe",
            },
            name: {
              type: "string",
              description:
                'The name of the ingredient. e.g. "Vanilla" or "Apple"',
            },
          },
        },
        description: "A list of the ingredients ",
      },
      instructions: {
        type: "array",
        items: {
          type: "string",
        },
        description: "A list of step-by-step instructions to create the recipe",
      },
      prepTimeMinutes: { type: "number" },
      cookTimeMinutes: { type: "number" },
      numServings: { type: "number" },
    },
    required: ["ingredients", "instructions"],
  },
};

export interface ExtractedRecipe {
  name: string;
  ingredients: {
    unit: string;
    quantity: number;
    name: string;
  }[];
  instructions: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  numServings?: number;
}
