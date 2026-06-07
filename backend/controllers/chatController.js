const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name avatar role isOnline lastSeen mentorProfile')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    // Format conversations for the client
    const formatted = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user.id.toString()
      );
      const unreadCount = conv.unreadCounts?.get(req.user.id.toString()) || 0;

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt
      };
    });

    sendResponse(res, 200, { conversations: formatted });
  } catch (error) {
    console.error('Get conversations error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get or create a conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 400, 'Please provide userId to chat with');
    }

    if (userId === req.user.id.toString()) {
      return sendError(res, 400, 'Cannot start a conversation with yourself');
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return sendError(res, 404, 'User not found');
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
      isActive: true
    }).populate('participants', 'name avatar role isOnline lastSeen');

    if (conversation) {
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== req.user.id.toString()
      );
      return sendResponse(res, 200, {
        conversation: {
          _id: conversation._id,
          otherUser: otherParticipant,
          lastMessage: conversation.lastMessage,
          unreadCount: conversation.unreadCounts?.get(req.user.id.toString()) || 0,
          updatedAt: conversation.updatedAt,
          isNew: false
        }
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user.id, userId],
      lastMessage: {
        text: '',
        sender: req.user.id,
        timestamp: new Date()
      }
    });

    // Populate for response
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role isOnline lastSeen');

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== req.user.id.toString()
    );

    sendResponse(res, 201, {
      conversation: {
        _id: conversation._id,
        otherUser: otherParticipant,
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
        updatedAt: conversation.updatedAt,
        isNew: true
      }
    }, 'Conversation created');
  } catch (error) {
    console.error('Get/create conversation error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    const total = await Message.countDocuments({ conversation: req.params.id });
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Send a message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { text, messageType, attachments } = req.body;

    if (!text || !text.trim()) {
      return sendError(res, 400, 'Message text is required');
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Create message
    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      text: text.trim(),
      messageType: messageType || 'text',
      attachments: attachments || []
    });

    // Update conversation's last message
    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user.id,
      timestamp: new Date()
    };

    // Increment unread count for other participant
    const otherParticipantId = conversation.participants.find(
      p => p.toString() !== req.user.id.toString()
    );
    if (otherParticipantId) {
      const currentCount = conversation.unreadCounts?.get(otherParticipantId.toString()) || 0;
      conversation.unreadCounts.set(otherParticipantId.toString(), currentCount + 1);
    }

    await conversation.save();

    // Populate sender info for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role');

    // Socket.IO emission will be handled by the socket layer
    sendResponse(res, 201, { message: populatedMessage }, 'Message sent');
  } catch (error) {
    console.error('Send message error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Mark all unread messages from other user as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user
    conversation.unreadCounts.set(req.user.id.toString(), 0);
    await conversation.save();

    sendResponse(res, 200, {}, 'Messages marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    sendError(res, 500, error.message);
  }
};
