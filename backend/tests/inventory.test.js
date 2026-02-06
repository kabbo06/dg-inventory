const request = require('supertest');
const { app } = require('../app');

// 1. Mock Redis (Keep as is)
jest.mock('redis', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: jest.fn(),
        get: jest.fn().mockResolvedValue('test_secret')
    })
}));

// 2. Updated Mongoose Mock to handle Virtuals
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        connect: jest.fn(),
        // We create a mock that supports the .virtual().get() chain
        Schema: jest.fn().mockImplementation(() => ({
            virtual: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnThis() // Allows .get() to be called
            })
        })),
        model: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }),
            findByIdAndUpdate: jest.fn().mockResolvedValue({}),
            findByIdAndDelete: jest.fn().mockResolvedValue({}),
            prototype: { save: jest.fn().mockResolvedValue({}) }
        })
    };
});

describe('Inventory API Unit Tests', () => {
    test('GET /api/products - Should return 401 if no token provided', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(401);
    });

    test('POST /api/products - Should fail if unauthorized', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ name: 'Test Product' });
        expect(res.statusCode).toBe(401);
    });
});
