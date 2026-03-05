const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const proposalChatSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
    unique: true
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

proposalChatSchema.index({ proposal: 1 });
proposalChatSchema.index({ vendedor: 1 });

module.exports = mongoose.model('ProposalChat', proposalChatSchema);
