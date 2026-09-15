
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    vibe: {
        type: Schema.Types.ObjectId,
        ref: 'Vibe',
        required: true
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

RequestSchema.index({ vibe: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);
