const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Step 1: Personal details
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], lowercase: true },
  phone: { type: String, required: [true, 'Phone is required'], match: [/^\d{10}$/, 'Phone must be 10 digits'] },
  parentName: { type: String, trim: true },
  parentPhone: { type: String, match: [/^\d{0,10}$/, 'Parent phone max 10 digits'] },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  // Step 2: Academic details
  currentClass: { type: String, trim: true },
  board: { type: String, trim: true },
  schoolName: { type: String, trim: true },
  stream: { type: String, trim: true },
  yearOfPassing: { type: String, trim: true },
  // Step 3: Coaching preference
  coachingInstitute: { type: String, required: [true, 'Select coaching institute'], trim: true },
  course: { type: String, required: [true, 'Select course'], trim: true },
  mode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
  additionalNotes: { type: String, maxlength: 500 },
  // Admin
  status: { type: String, enum: ['new', 'contacted', 'enrolled', 'closed'], default: 'new' },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
