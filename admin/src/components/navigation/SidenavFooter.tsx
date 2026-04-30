import AdminProfile from './AdminProfile';

interface SidenavFooterProps {
  sidebarExpanded: boolean;
}

const SidebarFooter: React.FC<SidenavFooterProps> = ({ sidebarExpanded }) => {
  return (
    <div className={`mt-auto mb-4 ${sidebarExpanded ? 'mx-3' : 'mx-1'}`}>
      <AdminProfile sidebarExpanded={sidebarExpanded} />
    </div>
  );
};

export default SidebarFooter;
