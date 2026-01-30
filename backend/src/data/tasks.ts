import { Task } from '../types';

export const COMPLEX_TASKS: Task[] = [
    {
        id: 'task-api-ratelimit',
        title: 'API Rate Limiter',
        description: 'Implement the `isAllowed(userId)` method in the RateLimiter class. It should allow max 5 requests per 10 seconds per user.',
        difficulty: 'hard',
        completed: false,
        codeSnippet: `
/**
 * API Rate Limiter Module
 * 
 * Objectives:
 * 1. Implement the Token Bucket or Sliding Window algorithm.
 * 2. Ensure thread-safety (mocked via sync methods).
 * 3. Expire old requests to prevent memory leaks.
 */

class Logger {
    log(msg) { console.log(\`[SYSTEM] \${msg}\`); }
    warn(msg) { console.warn(\`[WARN] \${msg}\`); }
}

class Database {
    constructor() {
        this.store = new Map();
    }
    
    get(key) { return this.store.get(key); }
    set(key, val) { this.store.set(key, val); }
}

class RequestConfig {
    constructor() {
        this.maxRequests = 5;
        this.windowSizeMs = 10000; // 10 seconds
    }
}

class RateLimiter {
    constructor() {
        this.db = new Database();
        this.config = new RequestConfig();
        this.logger = new Logger();
        this.logger.log('Rate Limiter Initialized');
    }

    /**
     * Determines if a user is allowed to make a request.
     * @param {string} userId - The unique ID of the user.
     * @returns {boolean} - true if allowed, false if blocked.
     */
    isAllowed(userId) {
        // --- YOUR CODE STARTS HERE ---
        // TODO: Implement rate limiting logic
        // Hint: Use Date.now() to track timestamps
        
        return true; 
        // --- YOUR CODE ENDS HERE ---
    }

    /**
     * Clear all records (Admin only)
     */
    reset() {
        this.db = new Database();
        this.logger.log('Database reset');
    }
}

// Test Suite (Do not modify)
const limiter = new RateLimiter();
function test() {
    console.log('Testing User A...');
    let allowedCount = 0;
    for(let i=0; i<7; i++) {
        if(limiter.isAllowed('user_A')) allowedCount++;
    }
    return allowedCount; 
}
`,
    },
    {
        id: 'task-order-processing',
        title: 'E-Commerce Order Processor',
        description: 'Implement `processOrder(order)` to validate inventory and process payment. Throw errors for invalid states.',
        difficulty: 'hard',
        completed: false,
        codeSnippet: `
/**
 * Message Queue Order Processing System
 * 
 * Objectives:
 * 1. Validate Stock availability.
 * 2. Deduct Stock if valid.
 * 3. Process Payment via PaymentGateway.
 * 4. Return order receipt.
 */

class Inventory {
    constructor() {
        this.stock = {
            'item-101': 5,
            'item-102': 0, // Out of stock
            'item-103': 100
        };
    }

    hasStock(itemId, quantity) {
        return (this.stock[itemId] || 0) >= quantity;
    }

    deduct(itemId, quantity) {
        if (!this.hasStock(itemId, quantity)) {
            throw new Error('Insufficient Stock');
        }
        this.stock[itemId] -= quantity;
        console.log(\`Stock remaining for \${itemId}: \${this.stock[itemId]}\`);
    }
}

class PaymentGateway {
    process(userId, amount) {
        if (amount < 0) throw new Error('Invalid Amount');
        if (amount > 1000) throw new Error('Credit Limit Exceeded');
        console.log(\`Processed payment of $\${amount} for \${userId}\`);
        return 'TRANS_' + Math.floor(Math.random() * 10000);
    }
}

class NotificationService {
    sendEmail(userId, msg) {
        console.log(\`Email to \${userId}: \${msg}\`);
    }
}

class OrderProcessor {
    constructor() {
        this.inventory = new Inventory();
        this.payment = new PaymentGateway();
        this.notifier = new NotificationService();
    }

    /**
     * Process an incoming order.
     * @param {object} order - { id, userId, itemId, quantity, price }
     * @returns {object} - { status: 'confirmed', transactionId: string }
     * @throws {Error} if validation fails
     */
    processOrder(order) {
        // --- YOUR CODE STARTS HERE ---
        // TODO: Validate stock, deduct stock, process payment.
        
        return { status: 'confirmed', transactionId: 'MOCK' };
        // --- YOUR CODE ENDS HERE ---
    }
}

// System Test
const processor = new OrderProcessor();
function testOrder() {
    try {
        return processor.processOrder({ 
            id: 'ord-1', 
            userId: 'user-1', 
            itemId: 'item-101', 
            quantity: 1, 
            price: 50 
        });
    } catch(e) {
        return e.message;
    }
}
`,
    },
    {
        id: 'task-auth-middleware',
        title: 'JWT Auth Middleware',
        description: 'Implement `verifyToken(token)` to decode a base64 mocked JWT, check expiration, and verify signature.',
        difficulty: 'hard',
        completed: false,
        codeSnippet: `
/**
 * Authentication Middleware Layer
 * 
 * Objectives:
 * 1. Decode generic Header/Payload/Signature structure.
 * 2. Validate "exp" (expiration) claim.
 * 3. Verify signature matches hidden secret.
 */

const SECRET_KEY = 'super-secret-key';

class CryptoUtils {
    static base64Decode(str) {
        // Mock implementation for simulation
        try {
            return JSON.parse(atob(str));
        } catch(e) { return {}; }
    }
    
    static verifySignature(header, payload, signature) {
        // Simple mock signature check
        // In real world: HMACSHA256(header + "." + payload, secret)
        const expected = header + payload + SECRET_KEY;
        // We will assume simpler check for this game:
        // Signature must contain the word 'verified'
        return signature.includes('verified');
    }
}

class AuthMiddleware {
    constructor() {
        this.allowAnonymous = false;
    }

    /**
     * Verifies a Bearer token.
     * Token format: "header.payload.signature" (Base64 encoded parts)
     * @param {string} token 
     * @returns {object} Decoded user payload if valid
     * @throws {Error} If invalid or expired
     */
    verifyToken(token) {
        // --- YOUR CODE STARTS HERE ---
        // TODO: Split token, decode parts, check expiration, check signature.
        
        return { id: 1, username: 'admin' };
        // --- YOUR CODE ENDS HERE ---
    }
}

// Helpers
function atob(str) {
    // Node.js mock for atob if needed, or assume environment supports it.
    // For this game environment, assume standard inputs.
    if(str === 'eyJhbGciOiJIUzI1NiJ9') return '{"alg":"HS256"}';
    if(str === 'eyJleHAiOjE5OTk5OTk5OTksInVzZXIiOiJhZG1pbiJ9') return '{"exp":1999999999,"user":"admin"}'; // Future
    if(str === 'eyJleHAiOjEwMDAwMDAwMDAsInVzZXIiOiJvbGQifQ==') return '{"exp":1000000000,"user":"old"}'; // Past
    return '{}';
}

const auth = new AuthMiddleware();
function testAuth() {
    try {
        // Valid token (Mock)
        const t = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE5OTk5OTk5OTksInVzZXIiOiJhZG1pbiJ9.verified_sig";
        return auth.verifyToken(t);
    } catch(e) { return e.message; }
}
`,
    }
];
