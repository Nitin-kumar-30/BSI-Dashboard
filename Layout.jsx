

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  Activity,
  BarChart3,
  Bell,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building,
  DollarSign,
  UserCheck,
  Palette,
  TrendingUp,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/api/entities";
import { Notification } from "@/api/entities";

import NotificationPanel from "./components/layout/NotificationPanel";
import UserProfile from "./components/layout/UserProfile";
import SettingsComponent from "./components/layout/Settings";
import AIAssistantFAB from "./components/layout/AIAssistantFAB";

const NavLink = ({ to, icon: Icon, text, collapsed, location }) => {
  const isActive = location.pathname === createPageUrl(to);
  return (
    <Link
      to={createPageUrl(to)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative ${
        isActive
          ? 'bg-cyan-400/10 text-cyan-400'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      } ${collapsed ? 'justify-center' : ''}`}
    >
       {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-full"></div>}
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{text}</span>}
    </Link>
  );
};

const NavSection = ({ title, icon: Icon, children, collapsed, expandedSection, setExpandedSection }) => {
  const isExpanded = expandedSection === title;
  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors text-slate-400 hover:text-white hover:bg-white/5 ${
          collapsed ? 'justify-center' : ''
        }`}
        onClick={() => setExpandedSection(isExpanded ? null : title)}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{title}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </>
        )}
      </div>
      {!collapsed && isExpanded && (
        <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-700 pl-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUser();
    loadNotificationCount();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const loadNotificationCount = async () => {
    try {
      const userData = await User.me();
      const notifications = await Notification.filter(
        { user_id: userData.id, is_read: false }
      );
      setUnreadCount(notifications.length);
    } catch (error) {
      console.log("Error loading notifications");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl(`Search?q=${encodeURIComponent(searchQuery)}`));
    }
  };

  return (
    <div className="flex h-screen app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app-container {
          background-color: #0D1117;
          color: #CDD6F4;
          position: relative;
          overflow: hidden;
        }

        .app-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 30%, rgba(0, 207, 232, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 70%, rgba(0, 100, 232, 0.15) 0%, transparent 40%);
          animation: aurora 20s infinite linear;
          z-index: 0;
        }

        .app-container::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.03) 1px), linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 1px);
          background-size: 3rem 3rem;
          opacity: 0.5;
          z-index: 0;
        }

        @keyframes aurora {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .glass-card, .sidebar-glass, .header-glass {
          background: rgba(13, 17, 23, 0.5);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #CDD6F4;
        }

        .glow-effect:hover {
          box-shadow: 0 0 15px rgba(0, 207, 232, 0.2), 0 0 5px rgba(0, 207, 232, 0.3);
          border-color: rgba(0, 207, 232, 0.5);
        }

        .gradient-text {
          background: linear-gradient(90deg, #E0E7FF 0%, #00CFE8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
      `}</style>
      
      {/* Sidebar */}
      <div className={`relative z-10 flex flex-col sidebar-glass transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
        {/* Brand Header */}
        <div className={`flex items-center p-6 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/50">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BrandStreet</h1>
                <p className="text-xs text-slate-400">Intelligence Hub</p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
          <NavLink to="Dashboard" icon={LayoutDashboard} text="Dashboard" collapsed={collapsed} location={location} />
          
          <NavSection title="HR" icon={UserCheck} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
            <NavLink to="HRDashboard" icon={LayoutDashboard} text="HR Dashboard" collapsed={collapsed} location={location} />
            <NavLink to="Employees" icon={Users} text="Employees" collapsed={collapsed} location={location} />
          </NavSection>

          <NavSection title="Procurement" icon={ShoppingCart} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
            <NavLink to="PurchaseOrders" icon={ShoppingCart} text="Purchase Orders" collapsed={collapsed} location={location} />
            <NavLink to="Vendors" icon={Building} text="Vendors" collapsed={collapsed} location={location} />
          </NavSection>

          <NavSection title="Business Units" icon={Building} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
            <NavLink to="Contacts" icon={Users} text="Contacts" collapsed={collapsed} location={location} />
            <NavLink to="Leads" icon={Target} text="Leads" collapsed={collapsed} location={location} />
            <NavLink to="Activities" icon={Activity} text="Activities" collapsed={collapsed} location={location} />
          </NavSection>

          <NavSection title="Lead Generation" icon={TrendingUp} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
            <NavLink to="Campaigns" icon={Target} text="Campaigns" collapsed={collapsed} location={location} />
            <NavLink to="LeadAnalytics" icon={BarChart3} text="Lead Analytics" collapsed={collapsed} location={location} />
          </NavSection>
          
          <NavSection title="Design" icon={Palette} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
              <NavLink to="DesignProjects" icon={Palette} text="Projects" collapsed={collapsed} location={location} />
              <NavLink to="DesignAssets" icon={Activity} text="Assets" collapsed={collapsed} location={location} />
          </NavSection>

          <NavSection title="Finance" icon={DollarSign} collapsed={collapsed} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
              <NavLink to="FinanceReports" icon={BarChart3} text="Reports" collapsed={collapsed} location={location} />
              <NavLink to="Budgets" icon={DollarSign} text="Budgets" collapsed={collapsed} location={location} />
          </NavSection>
        </nav>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="header-glass px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{currentPageName}</h2>
              <p className="text-sm text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 bg-slate-900/80 border-slate-700 rounded-full shadow-lg"
                  />
                </div>
              </form>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold">{unreadCount}</span>
                  </div>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>

              {user && (
                <div
                  className="flex items-center gap-3 pl-4 border-l border-slate-700 cursor-pointer group"
                  onClick={() => setShowProfile(true)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-lg border border-cyan-400/50 group-hover:border-cyan-400 transition-colors">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">{user.full_name}</p>
                    <p className="text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
            {children}
        </main>
      </div>

      {/* Modals & FAB */}
      <div className="relative z-20">
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onUpdateCount={loadNotificationCount}
        />
        <UserProfile
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onUpdate={loadUser}
        />
        <SettingsComponent
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
        <AIAssistantFAB />
      </div>
    </div>
  );
}

