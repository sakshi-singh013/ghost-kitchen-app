import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',        icon: '▣' },
  { id: 'location',     label: 'Find Location',   icon: '◎' },
  { id: 'analytics',   label: 'Analytics',        icon: '╌' },
  { id: 'search',      label: 'Search',           icon: '⌕' },
  { id: 'ai',          label: 'AI Analyst',       icon: '✦' },
  { id: 'admin',       label: 'Admin',            icon: '⊙' },
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🔥</span>
        <span className="sidebar-logo-text">Ghost Kitchen</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
