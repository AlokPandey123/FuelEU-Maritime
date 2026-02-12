import mongoose from 'mongoose';

const poolMemberSchema = new mongoose.Schema({
  shipId: { type: String, required: true },
  cbBefore: { type: Number, required: true },
  cbAfter: { type: Number, required: true },
});

const poolSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  members: [poolMemberSchema],
}, { timestamps: true });

export const PoolModel = mongoose.model('Pool', poolSchema);
