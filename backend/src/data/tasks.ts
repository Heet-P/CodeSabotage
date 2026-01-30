import { Task } from '../types';

export const INITIAL_CODEBASE = `
/**
 * SYSTEM CONTROLLER v2.0
 * 
 * This class controls the core logic of the ship's mainframe.
 * distinct modules handle Data, Power, and security.
 * 
 * your job is to fix the BUGs in the system.
 */

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class SystemController {
    constructor() {
        this.storage = [];
        this.queue = [];
        this.users = [
            { id: 1, name: 'Admin' },
            { id: 4, name: 'Engineer' },
            { id: 7, name: 'Navigator' },
            { id: 12, name: 'Pilot' }
        ]; // Sorted by ID
    }

    /**
     * TASK 1: Stack Management
     * Add an item to the top of the stack (this.storage).
     */
    stackPush(item) {
        if (!item) return false;
        // TODO: Something is missing here!
        
        return true;
    }

    stackPop() {
        if (this.storage.length === 0) return null;
        return this.storage.pop();
    }

    /**
     * TASK 2: Queue Management
     * Remove the first item from the queue and return it.
     */
    queueDequeue() {
        if (this.queue.length === 0) return null;
        // TODO: Remove and return the first element
        // Hint: Array.prototype.shift()
        
    }

    queueEnqueue(item) {
        this.queue.push(item);
        return true;
    }

    /**
     * TASK 3: Binary Search
     * Find a user by ID in the sorted this.users array.
     * Returns the user object or null.
     */
    findUserById(targetId) {
        let left = 0;
        let right = this.users.length - 1;

        while (left <= right) {
            // TODO: Calculate the midpoint correctly
            // let mid = ...
            
            if (this.users[mid].id === targetId) {
                return this.users[mid];
            }
            if (this.users[mid].id < targetId) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return null;
    }

    /**
     * TASK 4: Recursion (Fibonacci)
     * Calculate the Nth fibonacci number for energy regulation.
     * 0, 1, 1, 2, 3, 5, 8...
     */
    calculateFibonacci(n) {
        // TODO: Missing base case! Infinite loop risk.
        // if (n <= 1) ...
        
        return this.calculateFibonacci(n - 1) + this.calculateFibonacci(n - 2);
    }

    /**
     * TASK 5: Security (Valid Parentheses)
     * Check if the security token (string of brackets) is valid.
     * e.g. "()" valid, "(]" invalid
     */
    validateToken(token) {
        const stack = [];
        const map = {
            '(': ')',
            '[': ']',
            '{': '}'
        };

        for (let char of token) {
            if (map[char]) {
                stack.push(map[char]);
            } else {
                // TODO: Check if stack is empty or mismatch
                // if (stack.pop() !== char) return false;
            }
        }

        return stack.length === 0;
    }
}
`;

export const GAP_FILL_TASKS: Task[] = [
    {
        id: 'task-stack-push',
        title: 'Fix System Storage',
        description: 'The `stackPush` method is not saving data. Add the missing line to push items to `this.storage`.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: '', // Not used in Monolithic mode
    },
    {
        id: 'task-queue-dequeue',
        title: 'Fix Request Queue',
        description: 'The `queueDequeue` method returns nothing. Implement logic to remove and return the first item.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: '',
    },
    {
        id: 'task-binary-search',
        title: 'Fix User Lookup',
        description: '`findUserById` is crashing. Calculate the `mid` index correctly inside the while loop.',
        difficulty: 'medium',
        completed: false,
        codeSnippet: '',
    },
    {
        id: 'task-fibonacci',
        title: 'Stabilize Energy Stream',
        description: '`calculateFibonacci` causes a stack overflow. Add the missing base case for n <= 1.',
        difficulty: 'medium',
        completed: false,
        codeSnippet: '',
    },
    {
        id: 'task-validate-token',
        title: 'Patch Security Protocol',
        description: '`validateToken` accepts invalid keys. Add the logic to check `stack.pop()` against the current character.',
        difficulty: 'hard',
        completed: false,
        codeSnippet: '',
    }
];
