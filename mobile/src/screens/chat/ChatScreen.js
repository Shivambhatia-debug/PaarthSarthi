import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const ChatScreen = ({ navigation, route }) => {
  const { conversationId, otherUser } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const socket = useSocket();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const isOnline = socket?.isUserOnline(otherUser?._id);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages?limit=50`);
      setMessages(response.data?.messages || []);

      // Mark as read
      await api.put(`/chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket.IO listeners
  useEffect(() => {
    if (socket?.socket) {
      socket.joinConversation(conversationId);

      // Listen for new messages
      socket.socket.on('newMessage', (data) => {
        if (data.conversationId === conversationId) {
          setMessages(prev => [...prev, data.message]);
          // Mark as read immediately since we're in the chat
          api.put(`/chat/conversations/${conversationId}/read`).catch(() => {});
        }
      });

      // Listen for typing
      socket.socket.on('userTyping', (data) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          setIsOtherTyping(data.isTyping);
        }
      });

      return () => {
        socket.leaveConversation(conversationId);
        socket.socket.off('newMessage');
        socket.socket.off('userTyping');
      };
    }
  }, [socket?.socket, conversationId]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      text: messageText,
      sender: { _id: user?.id, name: user?.name, avatar: user?.avatar },
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        text: messageText
      });

      // Replace temp message with real one
      setMessages(prev =>
        prev.map(m => m._id === tempMessage._id ? response.data.message : m)
      );

      // Emit via socket for real-time delivery
      socket?.emitMessage(conversationId, {
        ...response.data.message,
        recipientId: otherUser?._id
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setInputText(text);

    // Emit typing indicator
    socket?.emitTyping(conversationId, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emitTyping(conversationId, false);
    }, 2000);
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender?._id === user?.id;
    const showAvatar = !isMe && (index === 0 || messages[index - 1]?.sender?._id !== item.sender?._id);

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && showAvatar ? (
          item.sender?.avatar ? (
            <Image source={{ uri: item.sender.avatar }} style={styles.msgAvatar} />
          ) : (
            <View style={styles.msgAvatarPlaceholder}>
              <Text style={styles.msgAvatarText}>{getInitials(item.sender?.name)}</Text>
            </View>
          )
        ) : !isMe ? (
          <View style={styles.msgAvatarSpacer} />
        ) : null}

        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.createdAt ? formatTimeAgo(item.createdAt) : ''}
            {isMe && item.isTemp && ' ⏳'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingSpinner message="Loading messages..." />;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerUserInfo}>
          <View style={styles.headerAvatarWrap}>
            {otherUser?.avatar ? (
              <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>{getInitials(otherUser?.name)}</Text>
              </View>
            )}
            {isOnline && <View style={styles.headerOnlineDot} />}
          </View>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>{otherUser?.name || 'User'}</Text>
            <Text style={styles.headerStatus}>
              {isOtherTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyChatText}>Say hello! 👋</Text>
            <Text style={styles.emptyChatSubText}>Start the conversation</Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {isOtherTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { animationDelay: '0ms' }]} />
            <View style={[styles.dot, { animationDelay: '200ms' }]} />
            <View style={[styles.dot, { animationDelay: '400ms' }]} />
          </View>
          <Text style={styles.typingText}>{otherUser?.name?.split(' ')[0]} is typing...</Text>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={5000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#fff' : colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.card,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  msgAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  msgAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  msgAvatarSpacer: {
    width: 36,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  bubbleOther: {
    backgroundColor: colors.cardElevated,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyChatText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyChatSubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  textInput: {
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  sendBtnDisabled: {
    backgroundColor: colors.cardElevated,
  },
});

export default ChatScreen;
