// models/FakeUserData.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FakeUserDataSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true },
    fakeFirstName: { type: String, required: true },
    fakeLastName: { type: String, required: true },
    fakeDOB: { type: Date }, 
    fakeGender: { type: String },
    fakeStreetAddress: { type: String },
    fakeCity: { type: String },
    fakeState: { type: String },
    fakeZipCode: { type: String },
    fakeCountry: { type: String },
    
    generatedEmail: { type: String, required: true, unique: true, index: true },
    mailTmDomain: { type: String, required: true },
    //  enc/dnc 
    encryptedMailTmPassword: { type: String, required: true },
    mailTmPasswordIv: { type: String, required: true },
    mailTmPasswordAuthTag: { type: String, required: true },


    mailTmAccountId: { type: String, required: true, index: true },
}, { timestamps: true });


FakeUserDataSchema.virtual('fakeFullName').get(function() {
    return `${this.fakeFirstName} ${this.fakeLastName}`;
  });
  
  // Optional: Virtual for Age (calculate on retrieval)
  FakeUserDataSchema.virtual('fakeAge').get(function() {
    if (!this.fakeDOB) return null;
    const today = new Date();
    const birthDate = new Date(this.fakeDOB);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  });
  
  // Ensure virtuals are included when converting to JSON/Object if needed
  FakeUserDataSchema.set('toJSON', { virtuals: true });
  FakeUserDataSchema.set('toObject', { virtuals: true });
  

const FakeUserDataModel = mongoose.models.FakeUserData || mongoose.model('FakeUserData', FakeUserDataSchema);

export default FakeUserDataModel;