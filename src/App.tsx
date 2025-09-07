import "./App.css";
import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <div className="p-4 text-xl font-semibold flex items-center gap-4">
        <div>{t("app.title")}</div>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default App;

