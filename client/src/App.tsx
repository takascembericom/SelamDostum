import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LiveChat } from "@/components/live-chat";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Items from "@/pages/items";
import ItemDetail from "@/pages/item-detail";
import Profile from "@/pages/profile";
import UserProfile from "@/pages/user-profile";
import AddItem from "@/pages/add-item";
import Messages from "@/pages/messages";
import AdminPanel from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import EditItemPage from "@/pages/edit-item";
import { NotificationPermissionBanner } from "@/components/notifications/notification-permission-banner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/items" component={Items} />
      <Route path="/item/:id" component={ItemDetail} />
      <Route path="/items/:id/edit" component={EditItemPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/user/:id" component={UserProfile} />
      <Route path="/add-item" component={AddItem} />
      <Route path="/messages" component={Messages} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin-panel" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPage = location === '/admin' || location === '/admin-panel';

  if (isAdminPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedContent() {
  const { user } = useAuth();
  
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        {user && <NotificationPermissionBanner />}
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
      {user && <LiveChat />}
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
