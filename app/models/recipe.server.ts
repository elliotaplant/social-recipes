import type { User, Recipe } from "@prisma/client";

import { prisma } from "~/db.server";
import { notifierQueue } from "~/queues/notifier.server";

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
          recipeBlogUrl: true,
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
  instagramPostUrl: Recipe["instagramPostUrl"];
  userId: User["id"];
}) {
  // TODO: Get recipe details from the Instagram post
  // const recipeDetails = await getRecipeFromInstagramPost(instagramPostUrl);
  await notifierQueue.add("notification email", {
    emailAddress: JSON.stringify({ instagramPostUrl, userId }),
  });

  // Create a new recipe in the database with the fetched details
  return prisma.recipe.create({
    data: {
      name: Math.round(Math.random() * 1e10).toString(),
      createdBy: userId,
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      numServings: 4,
      instagramPostUrl,
      instagramAuthorUsername: "elliotaplant",
      instagramImageUrl:
        "https://scontent-sjc3-1.cdninstagram.com/v/t51.2885-15/315555840_2053900548133965_5090871943698814695_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTUyeDIwNDguc2RyIn0&_nc_ht=scontent-sjc3-1.cdninstagram.com&_nc_cat=109&_nc_ohc=1PpraGNk58MAX-7sc2A&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=Mjk3MjMyMzc0NDI1ODk2Mzk2Mg%3D%3D.2-ccb7-5&oh=00_AfBi1X8NKeX-eBwlMu-Dd6CUojwjjoSoVl2xf72XZfHb4Q&oe=65499A80&_nc_sid=ee9879",
      userRecipes: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
      // Connect other relations or create related records if necessary
      ingredients: {
        create: [
          { quantity: 1, unit: "lb", name: "butter" },
          { quantity: 1, unit: "", name: "Apple" },
          { quantity: 2, unit: "", name: "Pie Crust" },
          { quantity: 1, unit: "tbsp", name: "Cinnamon" },
        ],
      },
      instructions: {
        create: [
          { text: "Put pie crust in pan", stepNumber: 1 },
          { text: "Fill with apple, butter, and cinnamon", stepNumber: 2 },
          { text: "Bake at 350 for 2 hours", stepNumber: 3 },
        ],
      },
    },
  });
}

export function deleteRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({ where: { id, userId } });
}
