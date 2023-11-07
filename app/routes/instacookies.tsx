import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { redis } from "~/utils/redis.server";

export const INSTACOOKIE_REDIS_KEY = "INSTACOOKIE";

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<{ success?: string; error?: string }>
> => {
  const formData = await request.formData();
  const dsUserId = formData.get("ds_user_id");
  const sessionId = formData.get("sessionid");
  const password = formData.get("password");

  // Check if the password matches the environment variable
  if (password !== process.env.INSTACOOKIES_PASSWORD) {
    return json({ error: "Invalid password" }, { status: 400 });
  }

  // Assuming you have set up a Redis client and the `set` method is promisified
  try {
    const cookie = `ds_user_id: ${dsUserId}; sessionid: ${sessionId};`;
    await redis.set(INSTACOOKIE_REDIS_KEY, cookie);
    return json({ success: "Cookies have been set in Redis" });
  } catch (error) {
    // Handle errors, e.g., Redis not available
    let message = null;
    if (error && typeof error === "object" && "message" in error) {
      message = error.message;
    }
    return json(
      { error: `Failed to set cookies in Redis: ${message}` },
      { status: 500 },
    );
  }
};

export default function SetInstacookiesPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold text-center">Set Cookies</h1>

        <Form method="post" className="mt-4">
          <label
            htmlFor="ds_user_id"
            className="block text-sm font-medium text-gray-700"
          >
            DS User ID:
          </label>
          <input
            type="text"
            id="ds_user_id"
            name="ds_user_id"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <label
            htmlFor="sessionid"
            className="block text-sm font-medium text-gray-700 mt-4"
          >
            Session ID:
          </label>
          <input
            type="text"
            id="sessionid"
            name="sessionid"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mt-4"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
          >
            Set Cookies in Redis
          </button>
        </Form>

        {actionData?.error ? (
          <p
            className="bg-red-100 text-red-700 border border-red-400 mt-4 px-4 py-3 rounded relative"
            role="alert"
          >
            {actionData.error}
          </p>
        ) : null}

        {actionData?.success ? (
          <p
            className="bg-green-100 text-green-700 border border-green-400 mt-4 px-4 py-3 rounded relative"
            role="alert"
          >
            {actionData.success}
          </p>
        ) : null}

        <h3 className="text-lg text-center">How to find cookies</h3>
        <p>
          {
            'Go to Dev Tools > Application > Cookies. Copy "ds_user_id" and "sessionid"'
          }
        </p>
      </div>
    </div>
  );
}
