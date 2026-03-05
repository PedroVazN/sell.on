const mongoose = require('mongoose');

const lossReasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

lossReasonSchema.index({ order: 1 });
lossReasonSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('LossReason', lossReasonSchema);
