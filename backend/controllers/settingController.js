const Setting = require('../models/Setting');
const { sendResponse, sendError } = require('../utils/helpers');

const TICKER_KEY = 'ticker_text';
const DEFAULT_TICKER = 'OFFER — Get admission now';

// @desc    Get ticker text (public)
// @route   GET /api/settings/ticker
exports.getTicker = async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: TICKER_KEY });
    sendResponse(res, 200, { ticker: doc?.value ?? DEFAULT_TICKER });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update ticker text (admin)
// @route   PUT /api/settings/ticker
exports.updateTicker = async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const doc = await Setting.findOneAndUpdate(
      { key: TICKER_KEY },
      { value: text || DEFAULT_TICKER },
      { upsert: true, new: true }
    );
    sendResponse(res, 200, { ticker: doc.value }, 'Ticker updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
