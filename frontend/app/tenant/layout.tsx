import Navbar from '@/components/Navbar';
import TenantSidebar from '@/components/TenantSidebar';

export default function TenantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <TenantSidebar />
      <div className="tenant-page-shell lg:pl-64">
        {children}
      </div>
      <style>{`
        .tenant-page-shell > div > aside,
        .tenant-page-shell .sidebar-overlay,
        .tenant-page-shell .bottom-nav-mobile,
        .tenant-page-shell .show-mobile {
          display: none !important;
        }

        .tenant-page-shell .main-offset,
        .tenant-page-shell .main-content,
        .tenant-page-shell main {
          margin-left: 0 !important;
        }

        .tenant-page-shell header.fixed {
          left: 16rem !important;
        }

        @media (max-width: 1023px) {
          .tenant-page-shell {
            padding-left: 0 !important;
          }

          .tenant-page-shell header.fixed {
            left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
