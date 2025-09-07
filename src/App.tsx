import "./App.css";
import { Outlet } from "react-router";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  return (
    <>
      <div className="p-4 text-xl font-semibold flex items-center gap-4">
        {/* <div>{t("app.title")}</div> */}
        <div className="ltr:ml-auto rtl:mr-auto">
          <LanguageSwitcher />
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default App;

