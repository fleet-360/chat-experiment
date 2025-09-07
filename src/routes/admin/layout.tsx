import { Link, NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-semibold">{t("common.adminArea")}</div>
        <nav className="flex gap-3 text-sm">
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            {t("nav.settings")}
          </NavLink>
          <NavLink to="/admin/chat" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            {t("nav.chat")}
          </NavLink>
        </nav>
        <div className="ltr:ml-auto rtl:mr-auto  text-xs">
          <Link to="/user" className="underline">{t("common.goToUser")}</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
