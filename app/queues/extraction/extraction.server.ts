import { prisma } from "~/db.server";
import { registerQueue } from "~/utils/queue.server";

import { extract } from "./extract";

interface QueueData {
  instagramPostUrl: string;
  userId: string;
}

export const extractionQueue = registerQueue<QueueData>(
  "extraction",
  async (job) => {
    await job.log(`Beginning extraction job ${JSON.stringify(job.data)}`);
    const { username, recipe, failureReason, blogUrl, query } = await extract(
      job.data.instagramPostUrl,
    );

    if (failureReason) {
      console.log("Failed to create recipe:", failureReason);
      return;
    }

    if (!recipe) {
      console.log("Expected recipe, but found none and found no failureReason");
      return;
    }

    // Create a new recipe in the database with the fetched details
    return prisma.recipe.create({
      data: {
        name: recipe.name,
        createdBy: job.data.userId,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        numServings: recipe.numServings,
        instagramPostUrl: job.data.instagramPostUrl,
        instagramAuthorUsername: username,
        blogUrl,
        query,
        userRecipes: {
          create: {
            user: {
              connect: {
                id: job.data.userId,
              },
            },
          },
        },
        ingredients: {
          create: recipe.ingredients.map(({ quantity, unit, name }) => ({
            quantity,
            unit,
            name,
          })),
        },
        instructions: {
          create: recipe.instructions.map((text, index) => ({
            text,
            stepNumber: index + 1,
          })),
        },
      },
    });
  },
);
