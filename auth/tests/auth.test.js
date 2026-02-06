const request = require('supertest');
const { app } = require('../app');

// Mocking Mongoose to stay intact during CI pipeline tests
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    model: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 })
    }),
    Schema: jest.fn().mockImplementation(() => ({ virtual: jest.fn() }))
}));

describe('Auth API Unit Tests', () => {
    // Test for Login logic
    test('POST /auth/login - Should return 401 for incorrect login', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'admin', password: 'wrongpassword' });
        expect(res.statusCode).toBe(401);
    });

    // Test for Change Password logic
    test('POST /auth/change-password - Should return 404 for unknown user', async () => {
        const res = await request(app)
            .post('/auth/change-password')
            .send({ username: 'nonexistent', newPassword: 'new' });
        expect(res.statusCode).toBe(404);
    });
});
