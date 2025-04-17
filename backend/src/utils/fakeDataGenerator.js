// utils/fakeDataGenerator.js
import { faker } from '@faker-js/faker';

export const generateFakeName = () => {
    return faker.person.fullName();
};

// Generate a reasonably strong password for the Mail.tm account
export const generateMailTmPassword = () => {
    // Example: 12 chars, mix of cases, numbers, symbols
    return faker.internet.password({ 
        length: 14, 
        memorable: false,
        pattern: /[A-Za-z0-9!@#$%^&*()]/ 
    });
};