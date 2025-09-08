import "./App.css";
import { Outlet, redirect, useLoaderData } from "react-router";
import { ExperimentProvider } from "./context/ExperimentContext";
import { getExperiment } from "./services/experimentService";

function App() {
  const data = useLoaderData() as { experimentId: string; experiment: any } | null;
  const experimentId = data?.experimentId??"" ;
  const initial = data?.experiment ?? null;
  return (
    <ExperimentProvider experimentId={experimentId} initialData={initial}>
      {/* <div className="p-4 text-xl font-semibold flex items-center gap-4">
        <div>{t("app.title")}</div>
        <div className="ms-auto">
          <LanguageSwitcher />
        </div>
      </div> */}
      <Outlet />
    </ExperimentProvider>
  );
}

export default App;

// Root loader: ensure PROLIFIC_PID is present; store to localStorage or redirect
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const prolifId = url.searchParams.get("PROLIFIC_PID");

  // Avoid infinite loop when already on the required page
  if (!prolifId && ["/user",'/'].includes(pathname)) {
    return redirect("/prolific-required");
  }

  if (prolifId) {
      localStorage.setItem("userId", prolifId);
  }
  // Prefetch current experiment
  const experimentId = "exp1";

  if (experimentId) {
      localStorage.setItem("expId", experimentId);
    
  }
  const experiment = await getExperiment(experimentId);
  return { experimentId, experiment };
}
