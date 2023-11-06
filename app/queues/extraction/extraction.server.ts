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
    const { username, recipe, failureReason, blogUrl, query } = extract(
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
        instagramImageUrl:
          "https://scontent-sjc3-1.cdninstagram.com/v/t51.2885-15/315555840_2053900548133965_5090871943698814695_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTUyeDIwNDguc2RyIn0&_nc_ht=scontent-sjc3-1.cdninstagram.com&_nc_cat=109&_nc_ohc=1PpraGNk58MAX-7sc2A&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=Mjk3MjMyMzc0NDI1ODk2Mzk2Mg%3D%3D.2-ccb7-5&oh=00_AfBi1X8NKeX-eBwlMu-Dd6CUojwjjoSoVl2xf72XZfHb4Q&oe=65499A80&_nc_sid=ee9879",
        UserRecipes: {
          create: {
            user: {
              connect: {
                id: job.data.userId,
              },
            },
          },
        },
        // Connect other relations or create related records if necessary
      },
    });
  },
);
