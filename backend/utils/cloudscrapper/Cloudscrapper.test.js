const cloudscraper = require('./Cloudscrapper');

// Dumb test to check Jest integration with sonar
test('Cloudscraper GET test', async () => {
    const response = cloudscraper.cloudScrapperGet('http://rmz.cr/');
    expect(response).resolves.toBe(expect.anything());
});



