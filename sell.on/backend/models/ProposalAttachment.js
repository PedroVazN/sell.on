const mongoose = require('mongoose');

const proposalAttachmentSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['nf', 'contrato', 'catalogo', 'planilha', 'imagem', 'outro'],
      default: 'outro',
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'raw', 'video'],
      default: 'raw',
    },
    format: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

proposalAttachmentSchema.index({ proposal: 1, createdAt: -1 });

module.exports = mongoose.model('ProposalAttachment', proposalAttachmentSchema);
