import './Header.css';

export function Header({ username, roles, onLogout, onNavigateToAdmin, isAdminVisible }) {
    return (
        <header>
    <h2>Welcome to our application, {username ? username.toUpperCase() : 'GUEST'}!</h2>
    {username && (
        <div className="header-actions">
            {/* Add Admin navigation button that toggles between "Admin" and "Dashboard" */}
            {roles === "admin" && (
                <button onClick={onNavigateToAdmin} id="adminbutton">
                    {isAdminVisible ? 'Dashboard' : 'Admin'}
                </button>
            )}
            <button onClick={onLogout} id='logoutbutton'>Logout</button>
        </div>
    )}
</header>
    );
}
