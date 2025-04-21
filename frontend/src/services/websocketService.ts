import { io, Socket } from 'socket.io-client';

type PriceUpdateCallback = (coin: string, price: number, previousPrice: number | null) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: PriceUpdateCallback[] = [];
  private lastPrices: Record<string, number> = {}; // Track last price by coin

  // Initialize connection to WebSocket server
  connect(): void {
    if (this.socket) return; // Already connected
    
    console.log('Connecting to WebSocket server...');
    
    this.socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    
    this.socket.on('message', (data: { coin: string; price: number }) => {
      // Only notify callbacks if the price has actually changed
      if (this.lastPrices[data.coin] !== data.price) {
        const previousPrice = this.lastPrices[data.coin] || null;
        console.log(`Received new price update: ${data.coin} - $${data.price} (was: ${previousPrice ? '$' + previousPrice : 'unknown'})`);
        this.lastPrices[data.coin] = data.price; // Update stored price
        this.notifyCallbacks(data.coin, data.price, previousPrice);
      } else {
        console.log(`Ignored duplicate price for ${data.coin}: $${data.price}`);
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }
  
  // Register a callback for price updates
  onPriceUpdate(callback: PriceUpdateCallback): void {
    this.callbacks.push(callback);
  }
  
  // Remove a callback
  removeCallback(callback: PriceUpdateCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
  
  // Notify all registered callbacks
  private notifyCallbacks(coin: string, price: number, previousPrice: number | null): void {
    this.callbacks.forEach(callback => callback(coin, price, previousPrice));
  }
  
  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.lastPrices = {}; // Reset price tracking when disconnecting
    }
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
