import Link from "next/link";
import { CreateWorkflowButton } from "../components/create-workflow-button";

async function getWorkflows() {
  try {
    const res = await fetch("http://localhost:3002/workflows", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function Page() {
  const workflows = await getWorkflows();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by creating a new workflow
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <CreateWorkflowButton />
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {workflows.map((wf: any) => (
          <Link key={wf.id} href={`/workflow/${wf.id}`} className="group block p-6 border border-blue-900/50 bg-slate-900/50 rounded-xl hover:bg-blue-900/20 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h2 className="text-xl font-semibold text-blue-100 group-hover:text-blue-300 transition-colors">{wf.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                  <p className="text-blue-400/60 text-xs font-mono">ID: {wf.id}</p>
                </div>
              </div>
              <div className="text-blue-500/40 group-hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        ))}
        {workflows.length === 0 && (
          <div className="text-center p-12 border border-dashed border-blue-900/50 rounded-xl bg-slate-900/30">
            <p className="text-blue-400/60">No active protocols found. Initialize a new sequence.</p>
          </div>
        )}
      </div>
    </main>
  );
}
