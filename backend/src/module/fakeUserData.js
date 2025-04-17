// models/FakeUserData.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FakeUserDataSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fakeName: { type: String, required: true },
    generatedEmail: { type: String, required: true, unique: true, index: true },
    mailTmDomain: { type: String, required: true },
    // Store encrypted password + necessary components
    encryptedMailTmPassword: { type: String, required: true },
    mailTmPasswordIv: { type: String, required: true },
    mailTmPasswordAuthTag: { type: String, required: true },
    // Store Mail.tm specific ID
    mailTmAccountId: { type: String, required: true, index: true },
    // Optional: store token - generally safer NOT to store it persistently
    // mailTmToken: { type: String },
    // mailTmTokenExpiresAt: { type: Date },
}, { timestamps: true });

const FakeUserDataModel = mongoose.models.FakeUserData || mongoose.model('FakeUserData', FakeUserDataSchema);

export default FakeUserDataModel;