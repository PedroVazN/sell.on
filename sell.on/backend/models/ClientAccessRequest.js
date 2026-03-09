const mongoose = require('mongoose');

const clientAccessRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  respondedAt: {
    type: Date,
    default: null
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  message: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

clientAccessRequestSchema.index({ client: 1, requestedBy: 1 });
clientAccessRequestSchema.index({ status: 1 });
clientAccessRequestSchema.index({ client: 1, requestedBy: 1, status: 1 });

module.exports = mongoose.model('ClientAccessRequest', clientAccessRequestSchema);
