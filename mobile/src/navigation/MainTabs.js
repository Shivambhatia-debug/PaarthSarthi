import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Screens - Home
import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import MentorsScreen from '../screens/mentors/MentorsScreen';
import MentorDetailScreen from '../screens/mentors/MentorDetailScreen';
import BookMeetingScreen from '../screens/mentors/BookMeetingScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import AdmissionScreen from '../screens/admission/AdmissionScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import BlogDetailScreen from '../screens/blog/BlogDetailScreen';

// Screens - Chat
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Screens - Community
import CommunityScreen from '../screens/community/CommunityScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';

// Screens - Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyMeetingsScreen from '../screens/profile/MyMeetingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import SupportScreen from '../screens/profile/SupportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Admission" component={AdmissionScreen} />
    <Stack.Screen name="CoursesList" component={CoursesScreen} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <Stack.Screen name="MentorsList" component={MentorsScreen} />
    <Stack.Screen name="MentorDetail" component={MentorDetailScreen} />
    <Stack.Screen name="BookMeeting" component={BookMeetingScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="BlogsList" component={BlogScreen} />
    <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
  </Stack.Navigator>
);

// Chat Stack
const ChatStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Community Stack
const CommunityStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="CommunityMain" component={CommunityScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
  </Stack.Navigator>
);

// Mentors Stack
const MentorsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MentorsList" component={MentorsScreen} />
    <Stack.Screen name="MentorDetail" component={MentorDetailScreen} />
    <Stack.Screen name="BookMeeting" component={BookMeetingScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="MyMeetings" component={MyMeetingsScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      const conversations = response.data?.conversations || [];
      const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchUnreadCount();

    if (socket?.socket) {
      socket.socket.on('conversationUpdated', fetchUnreadCount);
      socket.socket.on('newMessage', fetchUnreadCount);

      return () => {
        socket.socket.off('conversationUpdated', fetchUnreadCount);
        socket.socket.off('newMessage', fetchUnreadCount);
      };
    }
  }, [socket?.socket, fetchUnreadCount]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ChatTab':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'CommunityTab':
              iconName = focused ? 'globe' : 'globe-outline';
              break;
            case 'MentorsTab':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingBottom: Platform.OS === 'ios' ? 28 : 20,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 92 : 82,
          elevation: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ tabBarLabel: 'Chat', tabBarBadge: unreadCount > 0 ? unreadCount : undefined }} />
      <Tab.Screen name="CommunityTab" component={CommunityStack} options={{ tabBarLabel: 'Community' }} />
      <Tab.Screen name="MentorsTab" component={MentorsStack} options={{ tabBarLabel: 'Mentors' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MainTabs;

