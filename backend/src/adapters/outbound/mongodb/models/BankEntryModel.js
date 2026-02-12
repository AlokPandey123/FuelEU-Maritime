import mongoose from 'mongoose';

const bankEntrySchema = new mongoose.Schema({
  shipId: { type: String, required: true },
  year: { type: Number, required: true },
  amountGco2eq: { type: Number, required: true },
}, { timestamps: true });

bankEntrySchema.index({ shipId: 1, year: 1 });

export const BankEntryModel = mongoose.model('BankEntry', bankEntrySchema);
