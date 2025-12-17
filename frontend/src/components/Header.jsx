import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Settings, LogOut, UserCircle, Mail, X, Check, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Mock notifications - in production, fetch from API
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'alert', title: 'Vehicle VEH003 Alert', message: 'Battery health dropped below 30%', time: '5 min ago', read: false },
        { id: 2, type: 'info', title: 'Service Scheduled', message: 'Oil change for VEH001 confirmed for Dec 20', time: '1 hour ago', read: false },
        { id: 3, type: 'warning', title: 'Maintenance Due', message: 'VEH007 brake inspection overdue', time: '3 hours ago', read: false },
        { id: 4, type: 'success', title: 'Service Complete', message: 'VEH002 full service completed successfully', time: '1 day ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e, action) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
        if (e.key === 'Escape') {
            setShowProfileMenu(false);
            setShowNotifications(false);
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={16} className="text-red-400" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
            case 'success': return <Check size={16} className="text-green-400" />;
            case 'info': return <Info size={16} className="text-blue-400" />;
            default: return <Bell size={16} className="text-gray-400" />;
        }
    };

    const truncateEmail = (email, maxLength = 24) => {
        if (!email) return '';
        if (email.length <= maxLength) return email;
        return email.substring(0, maxLength - 3) + '...';
    };

    const handleLogout = () => {
        setShowProfileMenu(false);
        logout();
    };

    return (
        <header className="h-16 md:h-20 w-full flex items-center justify-between px-4 md:px-8 z-20 relative">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
                <Settings className="text-primary w-6 h-6 md:w-8 md:h-8" />
                <span className="text-lg md:text-2xl font-bold text-white tracking-wide hidden sm:block">AutoAide AI</span>
                <span className="text-lg font-bold text-white tracking-wide sm:hidden">AutoAide</span>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 md:py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="Search vehicles, services..."
                        aria-label="Search"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Email Display - Hidden on mobile, truncated on tablet */}
                {user?.email && (
                    <div 
                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full max-w-[200px] xl:max-w-[280px]"
                        title={user.email}
                    >
                        <Mail size={14} className="text-primary flex-shrink-0" />
                        <span className="text-gray-300 text-sm truncate">
                            {truncateEmail(user.email, 28)}
                        </span>
                    </div>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        onKeyDown={(e) => handleKeyDown(e, () => setShowNotifications(!showNotifications))}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                        aria-expanded={showNotifications}
                        aria-haspopup="true"
                    >
                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1 animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div 
                            className="absolute right-0 mt-2 w-80 md:w-96 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                            role="menu"
                            aria-orientation="vertical"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                                <h3 className="text-white font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-primary text-sm hover:underline focus:outline-none"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                                                !notification.read ? 'bg-primary/5' : ''
                                            }`}
                                            onClick={() => markAsRead(notification.id)}
                                            role="menuitem"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                clearNotification(notification.id);
                                                            }}
                                                            className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                                                            aria-label="Dismiss notification"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                                <button className="w-full text-center text-primary text-sm hover:underline focus:outline-none">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Button */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        onKeyDown={(e) => handleKeyDown(e, () => setShowProfileMenu(!showProfileMenu))}
                        className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label="User menu"
                        aria-expanded={showProfileMenu}
                        aria-haspopup="true"
                    >
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name || 'User'} 
                                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-white/20"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div 
                            className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-medium ${user?.avatar ? 'hidden' : ''}`}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-white text-sm font-medium hidden md:block max-w-[100px] truncate">
                            {user?.name || 'User'}
                        </span>
                        <ChevronDown 
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                        />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div 
                            className="absolute right-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                            role="menu"
                            aria-orientation="vertical"
                        >
                            {/* User Info Header */}
                            <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-blue-600/10">
                                <div className="flex items-center gap-3">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.name || 'User'} 
                                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold truncate">{user?.name || 'User'}</p>
                                        <p className="text-gray-400 text-sm truncate" title={user?.email}>
                                            {user?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    onClick={() => setShowProfileMenu(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus:outline-none focus:bg-white/5"
                                    role="menuitem"
                                >
                                    <UserCircle size={18} className="text-gray-400" />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => setShowProfileMenu(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus:outline-none focus:bg-white/5"
                                    role="menuitem"
                                >
                                    <Calendar size={18} className="text-gray-400" />
                                    <span>My Appointments</span>
                                </button>
                                <button
                                    onClick={() => setShowProfileMenu(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus:outline-none focus:bg-white/5"
                                    role="menuitem"
                                >
                                    <Settings size={18} className="text-gray-400" />
                                    <span>Settings</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="py-2 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:bg-red-500/10"
                                    role="menuitem"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
