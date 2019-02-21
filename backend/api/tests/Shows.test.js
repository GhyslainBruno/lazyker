const request = require('supertest');
const app = require('../../server');

describe('Shows list', () => {
    test('It should response the GET method with a list of tv shows for the test user', (done) => {
        request(app)
            .get('/api/shows')
            // Test token - corresponds to the foobar@yopmail.com -> foobar account
            .set({'token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiYmQyOGVkYzNkMTBiOTI5ZjU3NWEyY2E2ODU0OWZjYTZkODg5OTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGF6eWtlci01NjhjNCIsImF1ZCI6ImxhenlrZXItNTY4YzQiLCJhdXRoX3RpbWUiOjE1NTA2NzIxNTgsInVzZXJfaWQiOiI0ZFBvMXpwR0NkWkdLdkxNYlRJcVRhMjNJa3UxIiwic3ViIjoiNGRQbzF6cEdDZFpHS3ZMTWJUSXFUYTIzSWt1MSIsImlhdCI6MTU1MDY3MjE4OSwiZXhwIjoxNTUwNjc1Nzg5LCJlbWFpbCI6ImZvb2JhckB5b3BtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJmb29iYXJAeW9wbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.VkL5b3N05wFjiI86JHniT4aaN7ApW1aObNvHnEV4-qMPO92c3Gr4dwkuQzJXd5Qy7M-XZ_IifmbK3TtZ0rv0CRlMPkhEiKroFlEMnh1LX2j3lElo3m2klutdNGOT7vTTIWUvpYdOR4-y2uVwAgllrl35xgGTC8xBwAmRLVu6fczYJF4cD3gWktKaQkvqRcINOqgMzZXvhbIfDBygMMw5hi-Z7-QMYIQ7x84o2M49GHzjKUv7YJCDuDtVC2PFbel01AiycYofIvM_QuOG3zR0MKvrKuaJqhGfnrwolpUyFB2TM0LKdo2QowFOXyPiesQjeir9i1NKPbJoM88zczGkeA'})
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});



