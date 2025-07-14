const axios = require('axios');

// List of common User-Agent strings to rotate for each request
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0"
];

// Helper function to pick a random User-Agent
function getRandomUserAgent() {
  const index = Math.floor(Math.random() * userAgents.length);
  return userAgents[index];
}

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  try {
    // Prepare headers to mimic a real browser request
    const headers = {
      'User-Agent': getRandomUserAgent(),
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.google.com/', // Logical referer to appear natural
      'Connection': 'keep-alive',
      // Add other headers if needed
    };

    // Make the HTTP GET request with a timeout and headers
    const response = await axios.get(url, {
      headers,
      timeout: 15000, // 15 seconds timeout
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx responses
      },
    });

    // Return the raw HTML content
    res.status(200).send(response.data);

  } catch (error) {
    // Handle HTTP errors and network issues
    let errorMessage = error.message;

    // If axios error with response, include status code
    if (error.response) {
      errorMessage = `Request failed with status code ${error.response.status}`;
    }

    res.status(500).json({ error: errorMessage });
  }
};
