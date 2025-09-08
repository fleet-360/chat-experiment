import "./App.css";
import { Outlet, redirect } from "react-router";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  return (
    <>
      <div className="p-4 text-xl font-semibold flex items-center gap-4">
        {/* <div>{t("app.title")}</div> */}
        <div className="ms-auto">
          <LanguageSwitcher />
        </div>
      </div>
      <Outlet />
    </>
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
    try {
      // Store under existing key used across the app
      localStorage.setItem("userId", prolifId);
    } catch (_) {
      // ignore storage failures
    }
  }
  return null;
}
