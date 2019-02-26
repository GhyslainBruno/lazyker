const request = require('supertest');
const app = require('../server');

test('Movies list', (done) => {
    request(app)
        .get('/api/movies')
        .then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
});