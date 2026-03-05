const mongoose = require('mongoose');

const opportunityActivitySchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['task', 'call', 'message'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  due_at: {
    type: Date,
    default: null,
  },
  completed_at: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

opportunityActivitySchema.index({ opportunity: 1 });
opportunityActivitySchema.index({ due_at: 1 });
opportunityActivitySchema.index({ isDeleted: 1 });

module.exports = mongoose.model('OpportunityActivity', opportunityActivitySchema);
