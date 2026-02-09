const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  responsible_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PipelineStage',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  estimated_value: {
    type: Number,
    required: true,
    min: 0,
  },
  win_probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  expected_close_date: {
    type: Date,
    default: null,
  },
  lead_source: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  next_activity_at: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'won', 'lost'],
    default: 'open',
  },
  loss_reason: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LossReason',
    default: null,
  },
  converted_sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null,
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

opportunitySchema.index({ client: 1 });
opportunitySchema.index({ responsible_user: 1 });
opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ expected_close_date: 1 });
opportunitySchema.index({ next_activity_at: 1 });
opportunitySchema.index({ converted_sale: 1 });
opportunitySchema.index({ isDeleted: 1 });
opportunitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
