// utils/fakeDataGenerator.js
import { faker } from '@faker-js/faker';

export const generateFakeProfile = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' }); // Generate DOB for adults
    const gender = faker.person.gender();

    //age stuff
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        // Generate a separate FAKE password for the profile concept
        password: faker.internet.password({ length: 12, prefix: 'FakeP@' }),
        dob: dob, // Date object
        age: age, // Calculated age
        gender: gender,
        streetAddress: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(), // Consider faker.location.countryCode() if preferred
        // Keep Mail.tm password generation separate
    };
};

export const generateMailTmPassword = () => {
    return faker.internet.password({ length: 14, memorable: false, pattern: /[A-Za-z0-9!@#$%^&*()]/ });
};