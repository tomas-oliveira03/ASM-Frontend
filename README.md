# ASM-Frontend

Frontend application for the Multiagent Systems crypto prediction project.

## Features

- Real-time cryptocurrency data visualization
- Price predictions display
- Sentiment analysis visualization
- Model performance metrics display
- Interactive time range selection
- Multiple cryptocurrency support

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Make sure the backend API is running on `http://localhost:3001`
4. Start the development server with `npm run dev`
5. Open your browser to the URL shown in the terminal

## API Integration

This application fetches data from a local API endpoint via a Vite proxy:
- Frontend requests `/api/crypto/{COIN_SYMBOL}`
- Vite proxies this to `http://localhost:3001/api/crypto/{COIN_SYMBOL}`

## Troubleshooting

If you encounter API connection issues:

1. **Check for `ECONNREFUSED` errors in the Vite console:** This means the frontend (via the Vite proxy) could not connect to the backend at `http://localhost:3001`.
   - **Solution:** Make sure your backend server is running and accessible on port 3001. Check the backend's console for startup errors.
2. **Check for 500 Internal Server Errors:** This means the backend received the request but encountered an error while processing it.
   - **Solution:** Check the backend server's logs for detailed error messages.
3. Verify the API endpoints are correctly implemented (e.g., `/api/crypto/BTC`).
4. Run the testing utilities in the browser console:
   - `window.testApiConnection.testDirect()`: Checks direct connection to backend (`http://localhost:3001`).
     - **If this fails with a CORS error (`Access-Control-Allow-Origin header missing`):** This is expected if your backend isn't configured for CORS. It confirms the backend *is running* but doesn't allow direct browser requests from `http://localhost:5173`. The application should still work via the proxy.
     - **If this fails with `ECONNREFUSED` or `net::ERR_FAILED`:** The backend server is likely not running or not accessible at `http://localhost:3001`.
   - `window.testApiConnection.testProxy()`: Checks if the Vite proxy (`/api/...`) can successfully reach the backend. This should work if the backend is running, regardless of backend CORS settings.

### Backend CORS Configuration (Optional, for Direct API Calls)

While the Vite proxy handles CORS for the main application, if you need to make *direct* calls from the browser to the backend (e.g., for testing with `testDirect` or other scenarios), you must configure CORS on your backend server.

**Example for Node.js/Express:**
```javascript
const cors = require('cors');
// Allow requests specifically from your frontend origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true // If you need to handle cookies or authorization headers
}));
```

**Example for Python/Flask:**
```python
from flask_cors import CORS
# Allow requests specifically from your frontend origin
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
```

## Dependencies

- React
- Chart.js
- React-ChartJS-2
- Vite
- TypeScript