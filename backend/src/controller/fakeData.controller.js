// controllers/fakeData.controller.js

import FakeUserDataModel from '../module/fakeUserData.js'; 
import { tryCatch } from '../utils/tryCatch.js'; 
import AppError from '../utils/AppError.js'; 
import { faker } from '@faker-js/faker'; 

import { generateFakeProfile, generateMailTmPassword } from '../utils/fakeDataGenerator.js';
import { getMailTmDomains, createMailTmAccount, loginMailTmAccount, listMessages, getMessage } from '../utils/mailTmServices.js';
import { encryptServerData, decryptServerData } from '../utils/fakeServerEncryption.js';


// --- Generate Fake Data + Mail.tm Account ---
export const generateData = tryCatch(async (req, res) => {
    const userId = req.user._id;  
    const count = parseInt(req.body.count || '1', 10);
    const MAX_COUNT = 5; 

    if (isNaN(count) || count <= 0 || count > MAX_COUNT) {
        throw new AppError(400, `Invalid count. Please provide a number between 1 and ${MAX_COUNT}.`, 400);
    }

    // Fetch available domains ONCE before the loop
    const domains = await getMailTmDomains(); // Fetch email domains from Mail.tm // domails are like gmail.com
    if (!domains || domains.length === 0) {
        throw new AppError(503, "Could not retrieve email domains from the service.", 503); // Service Unavailable
    }

    const generatedResults = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
        try {
            // 1. Generate Fake Info
            const profile = generateFakeProfile();
            const mailTmPassword = generateMailTmPassword(); // Generate password for Mail.tm
            console.log(`profile:`, profile); // Log the generated profile

            console.log(`Mail.tm password for ${profile.firstName}:`, mailTmPassword); // Log the generated password
            // 2. Create Mail.tm Email Address
            const randomDomain = domains[Math.floor(Math.random() * domains.length)]; //getting any random domain from the list
            console.log(`Selected domain for ${profile.firstName}:`, randomDomain); // Log the selected domain
            // Generate a somewhat unique username part
            const emailUserPart = `${profile.firstName}.${profile.lastName}${faker.number.int({min:10,max:99})}`.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
            const generatedEmail = `${emailUserPart}@${randomDomain}`;


            console.log(`Generated email for ${profile.firstName}:`, generatedEmail); // Log the generated email
            // 3. Create Mail.tm Account via API
            const mailTmAccount = await createMailTmAccount(generatedEmail, mailTmPassword);
            if (!mailTmAccount || !mailTmAccount.id) {
                throw new Error(`Failed to create Mail.tm account for ${generatedEmail}.`);
            }

            // 4. Encrypt the Mail.tm Password using SERVER KEY
            // Replace encryptServerData if using Option B (encryptWithServerKey)
            const { iv, encryptedData, authTag } = encryptServerData(mailTmPassword);

            // 5. Save to DB
            const fakeUserData = new FakeUserDataModel({
                userId,
                fakeFirstName: profile.firstName,
                fakeLastName: profile.lastName,
                fakeDOB: profile.dob,
                fakeGender: profile.gender,
                fakeStreetAddress: profile.streetAddress,
                fakeCity: profile.city,
                fakeState: profile.state,
                fakeZipCode: profile.zipCode,
                fakeCountry: profile.country,

                generatedEmail,
                mailTmDomain: randomDomain,
                encryptedMailTmPassword: encryptedData,
                mailTmPasswordIv: iv,
                mailTmPasswordAuthTag: authTag,
                mailTmAccountId: mailTmAccount.id, // Store the ID from Mail.tm response
            });
            await fakeUserData.save();
            generatedResults.push({
                _id: fakeUserData._id,
                fullName: profile.fullName,
                email: generatedEmail,
                password: profile.password, 
                dob: profile.dob.toISOString().split('T')[0], 
                age: profile.age,
                gender: profile.gender,
                address: `${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}`,
                country: profile.country,
                createdAt: fakeUserData.createdAt
            });

        } catch (error) {
            console.error(`Error generating entry ${i + 1}:`, error.message);
            errors.push(`Failed to generate entry ${i + 1}: ${error.message}`);
            // Continue to next iteration if one fails
        }
    } // End loop

    if (generatedResults.length === 0 && errors.length > 0) {
         // If ALL failed
         throw new AppError(500, `Failed to generate any data. Errors: ${errors.join('; ')}`, 500);
    }

    res.status(201).json({
        success: true,
        msg: `Successfully generated ${generatedResults.length} out of ${count} requested entries.`,
        generated: generatedResults,
        ...(errors.length > 0 && { warnings: errors }), // Include warnings if some failed
    });
});

// --- Get Generation History ---
export const getHistory = tryCatch(async (req, res) => {
    const userId = req.user._id;

    const history = await FakeUserDataModel.find({ userId: userId })
        .select('fakeFirstName fakeLastName generatedEmail createdAt fakeDOB fakeGender fakeCity fakeState')
        .sort({ createdAt: -1 }); // Sort by newest first

        const historyWithAge = history.map(item => {
            const itemObj = item.toObject(); // Ensure virtuals are included if set on schema
            return {
                  _id: itemObj._id,
                  fullName: `${itemObj.fakeFirstName} ${itemObj.fakeLastName}`, // Or use virtual if available
                  email: itemObj.generatedEmail,
                  dob: itemObj.fakeDOB ? new Date(itemObj.fakeDOB).toLocaleDateString() : 'N/A',
                  age: itemObj.fakeAge, // Use virtual if available
                  gender: itemObj.fakeGender || 'N/A',
                  location: `${itemObj.fakeCity || ''}, ${itemObj.fakeState || ''}`,
                  createdAt: itemObj.createdAt
            };
       });
  

    res.status(200).json({
        success: true,
        count: historyWithAge.length,
        data: historyWithAge,
    });
});

// --- View Mail.tm Inbox (List Messages) ---
export const viewInbox = tryCatch(async (req, res) => {
    const userId = req.user._id;
    const fakeDataId = req.params.id; // Get ID from URL param: /api/fakedata/inbox/:id

    if (!fakeDataId) throw new AppError(400, "Missing generated data ID.", 400);

    // 1. Find the record and verify ownership
    const fakeData = await FakeUserDataModel.findOne({ _id: fakeDataId, userId: userId })
        .select('generatedEmail encryptedMailTmPassword mailTmPasswordIv mailTmPasswordAuthTag'); // Select needed fields
        // console.log(`fakeData: ${fakeData}`)

    if (!fakeData) {
        throw new AppError(404, "Generated data record not found or you are not authorized.", 404);
    }

    // 2. Decrypt the Mail.tm Password using SERVER KEY
    let mailTmPassword;
    try {
        // Replace decryptServerData if using Option B (decryptWithServerKey)
        mailTmPassword = decryptServerData(
            fakeData.mailTmPasswordIv,
            fakeData.encryptedMailTmPassword,
            fakeData.mailTmPasswordAuthTag
        );
        // console.log(`mailTmPassword: ${mailTmPassword}`) // Log the decrypted password
    } catch (decryptError) {
         console.error(`Server decryption failed for FakeData ID ${fakeDataId}:`, decryptError);
         throw new AppError(500, "Could not access required credentials.", 500); // Internal server error
    }

    console.log(`Decrypted Mail.tm password for ${fakeData.generatedEmail}:`, mailTmPassword); // Log the decrypted password
    // 3. Login to Mail.tm to get a token
    const mailTmToken = await loginMailTmAccount(fakeData.generatedEmail, mailTmPassword);
    console.log(`mailTmToken ${mailTmToken}`)
    // We don't need the password anymore after getting the token
    mailTmPassword = null;

    // 4. Fetch messages using the token
    const messages = await listMessages(mailTmToken);
    console.log(`message: ${messages}`)

    // 5. Respond with message list (only relevant header info)
    const messageHeaders = messages.map(msg => ({
        message_id: msg.id, // Mail.tm Message ID
        from: msg.from, // { address: "...", name: "..." }
        to: msg.to, // Array: [{ address: "...", name: "..." }]
        subject: msg.subject,
        intro: msg.intro, // Short intro text
        seen: msg.seen,
        createdAt: msg.createdAt,
        size: msg.size,
        hasAttachments: msg.hasAttachments || false // Check if attachments exist
    }));

    res.status(200).json({
        success: true,
        email: fakeData.generatedEmail,
        messages: messageHeaders,
    });
});

// --- View Specific Email Detail ---
export const viewEmailDetail = tryCatch(async (req, res) => {
     const userId = req.user._id;
     const fakeDataId = req.params.id; // Get FakeData ID (for auth check)
     const messageId = req.params.messageId; // Get Mail.tm Message ID

     if (!fakeDataId || !messageId) throw new AppError(400, "Missing generated data ID or message ID.", 400);

     // 1. Find the record and verify ownership (essential for auth)
     const fakeData = await FakeUserDataModel.findOne({ _id: fakeDataId, userId: userId })
         .select('generatedEmail encryptedMailTmPassword mailTmPasswordIv mailTmPasswordAuthTag');

     if (!fakeData) {
         throw new AppError(404, "Generated data record not found or you are not authorized.", 404);
     }

     // 2. Decrypt Mail.tm Password
     let mailTmPassword;
     try {
         // Replace decryptServerData if using Option B
         mailTmPassword = decryptServerData(
             fakeData.mailTmPasswordIv,
             fakeData.encryptedMailTmPassword,
             fakeData.mailTmPasswordAuthTag
         );
     } catch (decryptError) {
          console.error(`Server decryption failed for FakeData ID ${fakeDataId}:`, decryptError);
          throw new AppError(500, "Could not access required credentials.", 500);
     }

     // 3. Login to Mail.tm
     const mailTmToken = await loginMailTmAccount(fakeData.generatedEmail, mailTmPassword);
     mailTmPassword = null; // Clear password

     // 4. Fetch the specific message using the token and messageId
     const messageDetail = await getMessage(mailTmToken, messageId);

     // 5. Respond with relevant details
     res.status(200).json({
         success: true,
         email: fakeData.generatedEmail, // Provide context
         message: { // Structure the response clearly
             id: messageDetail.id,
             from: messageDetail.from,
             to: messageDetail.to,
             cc: messageDetail.cc || [],
             bcc: messageDetail.bcc || [],
             subject: messageDetail.subject,
             seen: messageDetail.seen,
             createdAt: messageDetail.createdAt,
             textBody: messageDetail.text || '', // Plain text version
             htmlBody: messageDetail.html?.[0] || '', // HTML version (usually an array, take first)
             attachments: messageDetail.attachments || [], // Include attachment info
             downloadUrl: messageDetail.downloadUrl, // URL to download the raw .eml source
         },
     });
});