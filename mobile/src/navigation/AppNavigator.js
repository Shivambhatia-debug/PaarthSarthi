import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import MentorTabs from './MentorTabs';
import LoadingSpinner from '../components/LoadingSpinner';

const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading ParthSarthi..." />;
  }

  const getTabsForRole = () => {
    if (user?.role === 'mentor') {
      return <MentorTabs />;
    }
    return <MainTabs />;
  };

  return (
    <NavigationContainer>
      {isAuthenticated ? getTabsForRole() : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;

