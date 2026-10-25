type NavigationProps = {
  activeMenu: string
  onMenuSelect: (menu: string) => void
}

const menuItems = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'My Reviews', icon: '▤' },
  { label: 'Submit Review', icon: '▣' },
  { label: 'Reviews', icon: '✓' },
  { label: 'Employees', icon: '♙' },
  { label: 'Review Period', icon: '♙'}
]

function Navigation({ activeMenu, onMenuSelect }: NavigationProps) {
  return (
    <aside className="navigation" aria-label="Main navigation">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span className="brand-name">Testleaf</span>
      </div>
      <nav>
        <ul className="menu-list">
          {menuItems.map((item) => {
            const isActive = item.label === activeMenu
            return (
              <li key={item.label}>
                <button
                  type="button"
                  className={`menu-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onMenuSelect(item.label)}
                >
                  <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Navigation
