import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ChatListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data?.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for conversation updates
  useEffect(() => {
    if (socket?.socket) {
      socket.socket.on('conversationUpdated', (data) => {
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv._id === data.conversationId) {
              return {
                ...conv,
                lastMessage: data.lastMessage,
                unreadCount: (conv.unreadCount || 0) + 1,
                updatedAt: new Date().toISOString()
              };
            }
            return conv;
          });
          return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      });

      return () => {
        socket.socket.off('conversationUpdated');
      };
    }
  }, [socket?.socket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }) => {
    const isOnline = socket?.isUserOnline(item.otherUser?._id);
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, hasUnread && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item._id,
          otherUser: item.otherUser
        })}
      >
        <View style={styles.avatarContainer}>
          {item.otherUser?.avatar ? (
            <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={item.otherUser?.role === 'mentor' ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
              style={styles.avatarPlaceholder}
            >
              <Text style={styles.avatarText}>
                {getInitials(item.otherUser?.name)}
              </Text>
            </LinearGradient>
          )}
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, hasUnread && styles.unreadName]} numberOfLines={1}>
              {item.otherUser?.name || 'User'}
            </Text>
            {item.otherUser?.role === 'mentor' && (
              <View style={styles.mentorBadge}>
                <Text style={styles.mentorBadgeText}>Mentor</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage?.text || 'Start a conversation...'}
          </Text>
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.timeText}>
            {item.lastMessage?.timestamp ? formatTimeAgo(item.lastMessage.timestamp) : ''}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner message="Loading chats..." />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>💬 Messages</Text>
        <Text style={styles.headerSubtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            message="Visit a mentor profile to start chatting!"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primaryFaded,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: colors.card,
  },
  conversationInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  unreadName: {
    fontWeight: '800',
  },
  mentorBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  mentorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  unreadMessage: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ChatListScreen;
