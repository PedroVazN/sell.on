const mongoose = require('mongoose');

const opportunityHistorySchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'stage_changed', 'status_changed', 'converted'],
  },
  field: {
    type: String,
    trim: true,
  },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

opportunityHistorySchema.index({ opportunity: 1, createdAt: -1 });

module.exports = mongoose.model('OpportunityHistory', opportunityHistorySchema);
