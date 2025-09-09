import { Link, NavLink, Outlet, redirect, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { requireAdminAuth, logoutAdmin } from "../../services/adminAuth";

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="p-4 ">
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
        <div className="ms-auto flex items-center gap-3 text-xs">
          <Link to="/user" className="underline">{t("common.goToUser")}</Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              logoutAdmin();
              navigate("/admin/login");
            }}
          >
            {t("common.logout")}
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

// Route loader to protect all /admin/* routes (except /admin/login which is separate)
export async function loader() {
  localStorage.removeItem("userId");
  const ok = await requireAdminAuth();
  if (!ok) {
    return redirect("/admin/login");
  }
  return null;
}
