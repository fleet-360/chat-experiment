import { createBrowserRouter } from "react-router";
import App from "../App";

// Lazy-load route components (map default export to Route Module Component)
const UserIndex = () =>
  import("./user/index").then((m) => ({ Component: m.default }));
const UserChat = () =>
  import("./user/chat").then((m) => ({ Component: m.default ,loader:m.loader}));
const UserQuestions = () =>
  import("./user/questions").then((m) => ({ Component: m.default }));

const AdminSettings = () =>
  import("./admin/settings").then((m) => ({ Component: m.default }));
const AdminChat = () =>
  import("./admin/adminChat").then((m) => ({ Component: m.default }));

// Layouts
const UserLayout = () =>
  import("./user/layout").then((m) => ({ Component: m.default }));
const AdminLayout = () =>
  import("./admin/layout").then((m) => ({ Component: m.default }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "user",
        lazy: UserLayout,
        children: [
          { index: true, lazy: UserIndex },
          { path: "chat", lazy: UserChat },
          { path: "questions", lazy: UserQuestions },
        ],
      },
      {
        path: "admin",
        lazy: AdminLayout,
        children: [
          { path: "settings", lazy: AdminSettings },
          { path: "chat", lazy: AdminChat },
        ],
      },
    ],
  },
]);

export default router;
