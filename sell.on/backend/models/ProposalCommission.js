const mongoose = require('mongoose');

const commissionAttachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number, min: 0 },
    resourceType: {
      type: String,
      enum: ['image', 'raw', 'video'],
      default: 'raw',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const proposalCommissionSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      unique: true,
      index: true,
    },
    nfNumber: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    attachments: {
      type: [commissionAttachmentSchema],
      default: [],
      validate: [
        (v) => Array.isArray(v) && v.length <= 2,
        'Máximo de 2 anexos por proposta',
      ],
    },
    validationStatus: {
      type: String,
      enum: ['em_analise', 'aprovado', 'reprovado'],
      default: 'em_analise',
      index: true,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    validatedAt: { type: Date, default: null },
    validationNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    updatedByVendedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

proposalCommissionSchema.index({ validationStatus: 1, updatedAt: -1 });

module.exports = mongoose.model('ProposalCommission', proposalCommissionSchema);
