import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { Header } from "~/components/header";
import { getUserRecipeListItems } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const userRecipeListItems = await getUserRecipeListItems({ userId });
  return json({ userRecipeListItems });
};

export default function RecipesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header title="Recipes" />

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Recipe
          </Link>

          <hr />

          {data.userRecipeListItems.length === 0 ? (
            <p className="p-4">No Recipes yet</p>
          ) : (
            <ol>
              {data.userRecipeListItems.map(({ recipe }) => (
                <li key={recipe.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={recipe.id}
                  >
                    📝 {recipe.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
