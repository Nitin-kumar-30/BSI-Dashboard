import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Contacts from "./Contacts";

import Leads from "./Leads";

import Activities from "./Activities";

import HRDashboard from "./HRDashboard";

import Employees from "./Employees";

import PurchaseOrders from "./PurchaseOrders";

import Vendors from "./Vendors";

import Campaigns from "./Campaigns";

import LeadAnalytics from "./LeadAnalytics";

import DesignProjects from "./DesignProjects";

import DesignAssets from "./DesignAssets";

import FinanceReports from "./FinanceReports";

import Budgets from "./Budgets";

import Search from "./Search";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Contacts: Contacts,
    
    Leads: Leads,
    
    Activities: Activities,
    
    HRDashboard: HRDashboard,
    
    Employees: Employees,
    
    PurchaseOrders: PurchaseOrders,
    
    Vendors: Vendors,
    
    Campaigns: Campaigns,
    
    LeadAnalytics: LeadAnalytics,
    
    DesignProjects: DesignProjects,
    
    DesignAssets: DesignAssets,
    
    FinanceReports: FinanceReports,
    
    Budgets: Budgets,
    
    Search: Search,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Contacts" element={<Contacts />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Activities" element={<Activities />} />
                
                <Route path="/HRDashboard" element={<HRDashboard />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/PurchaseOrders" element={<PurchaseOrders />} />
                
                <Route path="/Vendors" element={<Vendors />} />
                
                <Route path="/Campaigns" element={<Campaigns />} />
                
                <Route path="/LeadAnalytics" element={<LeadAnalytics />} />
                
                <Route path="/DesignProjects" element={<DesignProjects />} />
                
                <Route path="/DesignAssets" element={<DesignAssets />} />
                
                <Route path="/FinanceReports" element={<FinanceReports />} />
                
                <Route path="/Budgets" element={<Budgets />} />
                
                <Route path="/Search" element={<Search />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}