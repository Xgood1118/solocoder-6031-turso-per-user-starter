import { getDatabaseClient } from "@/app/utils";
import { getTodayDueCount } from "./actions";
import { DashboardShell } from "./dashboard-shell";

export async function Todos() {
  const client = await getDatabaseClient();

  if (!client) {
    return <p className="text-white/60 text-center">Database not ready</p>;
  }

  const [todos, projects, todayDueCount] = await Promise.all([
    client.query.todos.findMany(),
    client.query.projects.findMany(),
    getTodayDueCount(),
  ]);

  return (
    <DashboardShell
      initialTodos={todos || []}
      initialProjects={projects || []}
      todayDueCount={todayDueCount}
    />
  );
}
