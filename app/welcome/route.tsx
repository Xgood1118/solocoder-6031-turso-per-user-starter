import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { checkDatabaseExists, checkTableExists } from "../utils";

export async function GET() {
  const { userId } = auth().protect();

  const databaseExists = await checkDatabaseExists();

  if (databaseExists) {
    const todosTableExists = await checkTableExists("todos");
    if (todosTableExists) {
      return redirect("/dashboard");
    }
  }

  if (!userId) {
    return redirect("/sign-in");
  }

  return redirect("/welcome");
}
