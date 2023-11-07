import type { User, Recipe } from "@prisma/client";

import { prisma } from "~/db.server";
import { extractionQueue } from "~/queues/extraction/extraction.server";

export function getUserRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & { userId: User["id"] }) {
  return prisma.userRecipe.findFirst({
    where: { recipeId: id, userId },
    select: {
      recipe: {
        select: {
          id: true,
          name: true,
          prepTimeMinutes: true,
          cookTimeMinutes: true,
          numServings: true,
          instagramPostUrl: true,
          instagramAuthorUsername: true,
          instagramImageUrl: true,
          blogImageUrl: true,
          blogUrl: true,
          userRecipes: true,
          ingredients: true,
          instructions: true,
        },
      },
    },
  });
}

export function getUserRecipeListItems({ userId }: { userId: User["id"] }) {
  return prisma.userRecipe.findMany({
    where: { userId },
    select: {
      recipe: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc", // This orders by the updatedAt of the UserRecipe join table
    },
  });
}

export async function createRecipeFromInstagram({
  instagramPostUrl,
  userId,
}: {
  instagramPostUrl: NonNullable<Recipe["instagramPostUrl"]>;
  userId: User["id"];
}) {
  await extractionQueue.add("extract recipe", { instagramPostUrl, userId });
}

export function deleteRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({ where: { id, userId } });
}
