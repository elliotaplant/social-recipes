import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { extractionQueue } from "~/queues/extraction/extraction.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const instagramPostUrl = formData.get("instagramPostUrl");

  if (typeof instagramPostUrl !== "string" || instagramPostUrl.length === 0) {
    return json(
      {
        errors: {
          instagramPostUrl: "Instagram post URL is required",
          name: null,
        },
      },
      { status: 400 },
    );
  }

  // Add recipe to the extraction queue
  await extractionQueue.add("extract recipe", { instagramPostUrl, userId });

  return redirect(`/recipes/wait`);
};

export default function NewRecipePage() {
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const instagramPostUrlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.instagramPostUrl) {
      instagramPostUrlRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="flex flex-col gap-2 w-full">
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Instagram Post URL:</span>
          <input
            ref={instagramPostUrlRef}
            name="instagramPostUrl"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={
              actionData?.errors?.instagramPostUrl ? true : undefined
            }
            aria-errormessage={
              actionData?.errors?.instagramPostUrl
                ? "instagramPostUrl-error"
                : undefined
            }
          />
        </label>
        {actionData?.errors?.instagramPostUrl ? (
          <div className="pt-1 text-red-700" id="instagramPostUrl-error">
            {actionData.errors.instagramPostUrl}
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
