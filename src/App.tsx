import "./App.css";
import { Outlet, redirect, useLoaderData, useNavigation } from "react-router";
import { ExperimentProvider } from "./context/ExperimentContext";
import { getExperiment } from "./services/experimentService";
import Spinner from "./components/ui/spinner";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir();
    const lang = i18n.language;
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [i18n, i18n.language]);

  const data = useLoaderData() as {
    experimentId: string;
    experiment: any;
  } | null;
  const experimentId = data?.experimentId ?? "";
  const initial = data?.experiment ?? null;
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  return (
    <ExperimentProvider experimentId={experimentId} initialData={initial}>
      {isNavigating && <Spinner />}
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
  if (!prolifId && ["/user", "/"].includes(pathname)) {
    return redirect("/prolific-required");
  }

  if (prolifId) {
    localStorage.setItem("userId", prolifId);
  }
  // Prefetch current experiment
  const experimentId = "exp2";

  if (experimentId) {
    localStorage.setItem("expId", experimentId);
  }
  const experiment = await getExperiment(experimentId);
  return { experimentId, experiment };
}
