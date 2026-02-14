const Offer = require('../models/Offer');
const { sendResponse, sendError } = require('../utils/helpers');

// @desc    Get active offers (public – for homepage slideshow)
// @route   GET /api/offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    sendResponse(res, 200, { offers });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all offers (admin)
// @route   GET /api/offers/admin
// @access  Private/Admin
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ order: 1, createdAt: -1 });
    sendResponse(res, 200, { offers });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

function buildOfferBody(req) {
  const body = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    imageUrl: req.body.imageUrl || undefined,
    ctaText: req.body.ctaText,
    ctaLink: req.body.ctaLink,
    order: req.body.order !== undefined ? Number(req.body.order) : 0,
    isActive: req.body.isActive === 'true' || req.body.isActive === true
  };
  return body;
}

// @desc    Create offer (admin)
// @route   POST /api/offers
exports.createOffer = async (req, res) => {
  try {
    const payload = buildOfferBody(req);
    if (req.file && !payload.imageUrl) payload.imageUrl = `/uploads/offers/${req.file.filename}`;
    const offer = await Offer.create(payload);
    sendResponse(res, 201, { offer }, 'Offer added');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update offer (admin)
// @route   PUT /api/offers/:id
exports.updateOffer = async (req, res) => {
  try {
    const payload = buildOfferBody(req);
    if (req.file && !payload.imageUrl) payload.imageUrl = `/uploads/offers/${req.file.filename}`;
    const offer = await Offer.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!offer) return sendError(res, 404, 'Offer not found');
    sendResponse(res, 200, { offer }, 'Updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete offer (admin)
// @route   DELETE /api/offers/:id
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return sendError(res, 404, 'Offer not found');
    sendResponse(res, 200, null, 'Deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
