import { useEffect, useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

// Shared shell for every logged-in page: Header + Sidebar + main content.
function AppLayout({ area = "citizen", title, description, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <Header
        variant="app"
        area={area}
        menuOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
      />

      <div className="app-body">
        <Sidebar
          area={area}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="app-main">
          <div className="app-content">
            {(title || actions) && (
              <div className="page-head">
                <div>
                  {title && <h1>{title}</h1>}
                  {description && <p>{description}</p>}
                </div>

                {actions && <div className="page-head-actions">{actions}</div>}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
