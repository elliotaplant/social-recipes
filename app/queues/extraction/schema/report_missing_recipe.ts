export const REPORT_MISSING_RECIPE = {
  name: "report_missing_recipe",
  description: "Reports to the user that a recipe is not present",
  parameters: {
    type: "object",
    properties: {
      cause: {
        type: "string",
        description:
          "A short description explaining why the recipe was not found",
      },
    },
    required: ["cause"],
  },
};

export interface MissingReport {
  cause: string;
}
