import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteRecipe, getUserRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const userRecipe = await getUserRecipe({ id: params.recipeId, userId });
  if (!userRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ userRecipe });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  await deleteRecipe({ id: params.recipeId, userId });

  return redirect("/recipes");
};

export default function RecipeDetailsPage() {
  const {
    userRecipe: { recipe },
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{recipe.name}</h3>
      <div className="flex gap-4">
        {recipe.instagramPostUrl ? (
          <a className="text-blue-500" href={recipe.instagramPostUrl}>
            Instagram
          </a>
        ) : null}
        {recipe.blogUrl ? (
          <a className="text-blue-500" href={recipe.blogUrl}>
            Website
          </a>
        ) : null}
      </div>
      <div className="my-4">
        {recipe.prepTimeMinutes ? (
          <p>Preparation Time: {recipe.prepTimeMinutes} minutes</p>
        ) : null}
        {recipe.cookTimeMinutes ? (
          <p>Cooking Time: {recipe.cookTimeMinutes} minutes</p>
        ) : null}
        {recipe.numServings ? <p>Servings: {recipe.numServings}</p> : null}
      </div>
      <hr className="my-4" />
      <div>
        <h4 className="text-xl font-semibold">Ingredients</h4>
        <ul>
          {recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex gap-1">
                {ingredient.quantity ? (
                  <span>{ingredient.quantity}</span>
                ) : null}
                {ingredient.unit ? <span>{ingredient.unit}</span> : null}
                <span>{ingredient.name}</span>
              </li>
            ))
          ) : (
            <p>No ingredients listed.</p>
          )}
        </ul>
      </div>
      <hr className="my-4" />
      <div>
        <h4 className="text-xl font-semibold">Instructions</h4>
        <ol className="list-decimal pl-5">
          {recipe.instructions.length > 0 ? (
            recipe.instructions.map((instruction) => (
              <li key={instruction.stepNumber}>{instruction.text}</li>
            ))
          ) : (
            <p>No instructions provided.</p>
          )}
        </ol>
      </div>
      <Form method="post" className="mt-8">
        <button
          type="submit"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Recipe not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
