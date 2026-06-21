import { Home, LayoutDashboard, Bot, Radio, Puzzle, Clock, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", icon: Home, labelKey: "consoleNav.office" },
  { path: "/dashboard", icon: LayoutDashboard, labelKey: "consoleNav.dashboard" },
  { path: "/agents", icon: Bot, labelKey: "consoleNav.agents" },
  { path: "/channels", icon: Radio, labelKey: "consoleNav.channels" },
  { path: "/skills", icon: Puzzle, labelKey: "consoleNav.skills" },
  { path: "/cron", icon: Clock, labelKey: "consoleNav.cron" },
  { path: "/settings", icon: Settings, labelKey: "consoleNav.settings" },
] as const;

export function MobileBottomNav() {
  const { t } = useTranslation("layout");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex h-14 shrink-0 items-stretch border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className="text-[9px] font-medium leading-none tracking-wide">
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
