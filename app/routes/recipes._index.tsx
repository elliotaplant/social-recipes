import { Link } from "@remix-run/react";

export default function RecipeIndexPage() {
  return (
    <p>
      No recipe selected. Select a recipe on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new recipe.
      </Link>
    </p>
  );
}
