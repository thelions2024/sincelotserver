import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    walletName: String,
    balance: { type: Number, default: 0 },
    visibility: Boolean
});

export const WalletTwo = mongoose.model("WalletTwo",schema);