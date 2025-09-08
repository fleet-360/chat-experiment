import { createBrowserRouter } from "react-router";
import App, { loader as appLoader } from "../App";

// Lazy-load route components (map default export to Route Module Component)
const UserIndex = () =>
  import("./user/index").then((m) => ({ Component: m.default }));
const UserChat = () =>
  import("./user/chat").then((m) => ({ Component: m.default ,loader:m.loader}));
const UserQuestions = () =>
  import("./user/survey").then((m) => ({ Component: m.default }));
const UserThankYou = () =>
  import("./user/thank-you").then((m) => ({ Component: m.default }));

const AdminSettings = () =>
  import("./admin/settings").then((m) => ({ Component: m.default }));
const AdminChat = () =>
  import("./admin/adminChat").then((m) => ({ Component: m.default,loader:m.loader }));

// Layouts
const UserLayout = () =>
  import("./user/layout").then((m) => ({ Component: m.default }));
const AdminLayout = () =>
  import("./admin/layout").then((m) => ({ Component: m.default }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: appLoader,
    children: [
      {
        path: "prolific-required",
        lazy: () => import("./prolific-required").then((m) => ({ Component: m.default })),
      },
      {
        path: "user",
        lazy: UserLayout,
        children: [
          { index: true, lazy: UserIndex },
          { path: "chat", lazy: UserChat },
          { path: "survey", lazy: UserQuestions },
          { path: "thank-you", lazy: UserThankYou },
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
