// models/AppTrackerEntry.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const AppTrackerEntrySchema = new Schema({
    userId: { // Link to the user who owns this entry
        type: Schema.Types.ObjectId,
        ref: 'User', // Should match your user model name
        required: true,
        index: true
    },
    appName: { // Name of the application/website/service
        type: String,
        required: [true, 'Application name is required'],
        trim: true
    },
    dataShared: { // Array of data categories shared
        type: [String], // Array of strings
        required: [true, 'At least one data category must be specified'],
        validate: [array => array.length > 0, 'At least one data category must be specified']
    },
    calculatedRiskScore: { // Store the calculated risk score
        type: Number,
        required: true,
        default: 0,
        min: 0,
        // Define max based on your scoring system (e.g., 5 if max score is 5)
        max: 5,
        index: true // Index for potential sorting/filtering later
    },
    // Optional fields (can be added later or now if desired)
    // appUrl: { type: String, trim: true },
    // appCategory: { type: String, trim: true },
    // notes: { type: String },

}, { timestamps: true }); // Add createdAt and updatedAt automatically

const AppTrackerEntryModel = mongoose.models.AppTrackerEntry || mongoose.model('AppTrackerEntry', AppTrackerEntrySchema);

export default AppTrackerEntryModel;