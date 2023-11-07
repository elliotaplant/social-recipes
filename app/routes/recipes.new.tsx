import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { extractionQueue } from "~/queues/extraction/extraction.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const recipeUrl = formData.get("recipeUrl");

  if (typeof recipeUrl !== "string" || recipeUrl.length === 0) {
    return json(
      {
        errors: {
          recipeUrl: "Recipe URL is required",
          name: null,
        },
      },
      { status: 400 },
    );
  }

  // Add recipe to the extraction queue
  await extractionQueue.add("extract recipe", { recipeUrl, userId });

  return redirect(`/recipes/wait`);
};

export default function NewRecipePage() {
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const recipeUrl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.recipeUrl) {
      recipeUrl.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="flex flex-col gap-2 w-full">
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Recipe URL:</span>
          <input
            ref={recipeUrl}
            name="recipeUrl"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.recipeUrl ? true : undefined}
            aria-errormessage={
              actionData?.errors?.recipeUrl ? "recipeUrl-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.recipeUrl ? (
          <div className="pt-1 text-red-700" id="recipeUrl-error">
            {actionData.errors.recipeUrl}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
