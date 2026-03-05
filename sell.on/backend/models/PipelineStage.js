const mongoose = require('mongoose');

const pipelineStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  color: {
    type: String,
    trim: true,
    default: '#6b7280',
  },
  isWon: {
    type: Boolean,
    default: false,
  },
  isLost: {
    type: Boolean,
    default: false,
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

pipelineStageSchema.index({ order: 1 });
pipelineStageSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('PipelineStage', pipelineStageSchema);
