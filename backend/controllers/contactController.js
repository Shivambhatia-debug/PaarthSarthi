const Contact = require('../models/Contact');
const { sendResponse, sendError, getPagination, notifyAdmins } = require('../utils/helpers');

// @desc    Submit contact/callback request
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    // Notify admins
    const typeLabels = {
      callback: 'Callback Request',
      demo: 'Demo Request',
      inquiry: 'New Inquiry',
      support: 'Support Request',
      partnership: 'Partnership Inquiry',
      institution: 'Institution Inquiry'
    };

    await notifyAdmins({
      type: 'new_contact',
      title: typeLabels[contact.type] || 'New Contact',
      message: `${contact.name} (${contact.phone}) - ${contact.subject || contact.type}: ${contact.message.substring(0, 100)}`,
      relatedModel: 'Contact',
      relatedId: contact._id
    });

    sendResponse(res, 201, { contact }, 'Request submitted successfully! We will contact you soon.');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { type, status } = req.query;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update contact status (Admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContact = async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') updateData.resolvedAt = new Date();
    }
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!contact) {
      return sendError(res, 404, 'Contact not found');
    }

    sendResponse(res, 200, { contact }, 'Contact updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete contact (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return sendError(res, 404, 'Contact not found');
    }

    await contact.deleteOne();
    sendResponse(res, 200, {}, 'Contact deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
