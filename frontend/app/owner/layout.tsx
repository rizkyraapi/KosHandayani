import OwnerSidebar from '@/components/OwnerSidebar';

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OwnerSidebar />
      <div className="owner-page-shell">
        {children}
      </div>
      <style>{`
        .owner-page-shell {
          min-height: 100vh;
          padding-left: 256px;
        }

        .owner-page-shell aside,
        .owner-page-shell nav.sidebar-desktop,
        .owner-page-shell .sidenav,
        .owner-page-shell .sidebar,
        .owner-page-shell .bottom-nav-mobile,
        .owner-page-shell .mobile-topbar {
          display: none !important;
        }

        .owner-page-shell main,
        .owner-page-shell .main-content,
        .owner-page-shell .footer-content {
          margin-left: 0 !important;
        }

        .owner-page-shell main {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 1023px) {
          .owner-sidebar {
            display: none !important;
          }

          .owner-page-shell {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
