
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { db } from './services/mockDatabase';
import AuthScreen from './components/AuthScreen';
import OnboardingForm from './components/OnboardingForm';
import DesignerDashboard from './components/DesignerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setIsInitialized(true);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setIsEditingProfile(false);
  };

  const handleProfileComplete = () => {
    const updatedUser = db.getCurrentUser();
    setUser({ ...updatedUser! });
    setIsEditingProfile(false);
  };

  const handleStartEditing = () => {
    setIsEditingProfile(true);
  };

  if (!isInitialized) return null;

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Show onboarding if profile not completed OR if user clicked "Edit Credentials"
  if (user.role === UserRole.DESIGNER && (!user.profileCompleted || isEditingProfile)) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <OnboardingForm 
            userId={user.id} 
            email={user.email} 
            onComplete={handleProfileComplete} 
            initialData={db.getProfile(user.id)}
            isEditing={isEditingProfile}
            onCancel={() => setIsEditingProfile(false)}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      {user.role === UserRole.ADMIN ? (
        <AdminDashboard />
      ) : (
        <DesignerDashboard userId={user.id} onEditProfile={handleStartEditing} />
      )}
    </Layout>
  );
};

export default App;
