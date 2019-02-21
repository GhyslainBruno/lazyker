const request = require('supertest');
const app = require('../server');

describe('Shows list', () => {
    test('It should response the GET method with a list of tv shows for the test user', (done) => {
        request(app)
            .get('/api/shows')
            // Test token - corresponds to the foobar@yopmail.com -> foobar account
            .set({'token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiYmQyOGVkYzNkMTBiOTI5ZjU3NWEyY2E2ODU0OWZjYTZkODg5OTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGF6eWtlci01NjhjNCIsImF1ZCI6ImxhenlrZXItNTY4YzQiLCJhdXRoX3RpbWUiOjE1NTA3NDI5ODAsInVzZXJfaWQiOiI0ZFBvMXpwR0NkWkdLdkxNYlRJcVRhMjNJa3UxIiwic3ViIjoiNGRQbzF6cEdDZFpHS3ZMTWJUSXFUYTIzSWt1MSIsImlhdCI6MTU1MDc0Mjk4NSwiZXhwIjoxNTUwNzQ2NTg1LCJlbWFpbCI6ImZvb2JhckB5b3BtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJmb29iYXJAeW9wbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.XunCA2KVnds2fOECn5Kc2Czdf91c_uqsCFJZYW2_oDda4NGIomqHpBTpJ4catJrFIYX8ILXWtOPYLQp4tRYujcFUgpasttHWuTpH7f0LnAK2SZtIT-uKooZi_ud8Cfj3dPys3PE9Y4YQhZGEK-sbZVQnPvrifulYQO99o5aMg2L6mTGTitNNQvIvyT4neaTFEZZzN2T9-Hdkrn3hwRQpeEBWV9Mg5VFqOJYt9_6l3giLayMPdfA8K08Rn39Sgp-6o12NNYFmwKLn_sSEWtYf7JEgkjCLp7g_CMTlZR1IFo8fUWePO0HkPMWT1oQHs9bmPvy4K-8d6ZNXLCP4LypxBg'})
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});



