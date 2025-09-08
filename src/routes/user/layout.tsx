import { Link, NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";


export default function UserLayout() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-semibold">{t("common.userArea")}</div>
        <nav className="flex gap-3 text-sm">
          <NavLink
            to="/user"
            end
            className={({ isActive }) => (isActive ? "font-bold" : undefined)}
          >
            {t("nav.home")}
          </NavLink>
          <NavLink
            to="/user/chat"
            className={({ isActive }) => (isActive ? "font-bold" : undefined)}
          >
            {t("nav.chat")}
          </NavLink>
          <NavLink
            to="/user/survey"
            className={({ isActive }) => (isActive ? "font-bold" : undefined)}
          >
            {t("nav.questions")}
          </NavLink>
        </nav>
        <div className="ltr:mr-auto rtl:ml-auto text-xs">
          <Link to="/admin/settings" className="underline">
            {t("common.goToAdmin")}
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
