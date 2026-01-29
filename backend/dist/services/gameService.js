"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const lobbyService_1 = require("./lobbyService");
// Mock Tasks for now
const MOCK_TASKS = [
    {
        id: 'task-1',
        title: 'Fix Syntax Error',
        description: 'Find and fix the syntax error in the code.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function hello() {\n  console.log("Hello World"\n}',
    },
    {
        id: 'task-2',
        title: 'Implement Sum',
        description: 'Write a function that returns the sum of two numbers.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function sum(a, b) {\n  // Your code here\n}',
    },
    {
        id: 'task-3',
        title: 'Reverse String',
        description: 'Write a function that reverses a string.',
        difficulty: 'medium',
        completed: false,
        codeSnippet: 'function reverse(str) {\n  // Your code here\n}',
    }
];
const EMERGENCY_TASKS = [
    {
        id: 'emergency-1',
        title: 'SYSTEM FAILURE: RETURN 0',
        description: 'EMERGENCY: Write a function that returns 0 to reset the system.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function fix() {\n  return -1;\n}'
    },
    {
        id: 'emergency-2',
        title: 'SYSTEM FAILURE: RETURN 1',
        description: 'EMERGENCY: Write a function that returns 1 to enable backup power.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function fix() {\n  return 0;\n}'
    },
    {
        id: 'emergency-3',
        title: "SYSTEM FAILURE: RETURN 'FIXED'",
        description: "EMERGENCY: Return the string 'FIXED' to patch the breach.",
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function fix() {\n  return "ERROR";\n}'
    },
    {
        id: 'emergency-4',
        title: 'SYSTEM FAILURE: RETURN TRUE',
        description: 'EMERGENCY: Return true to acknowledge admin override.',
        difficulty: 'easy',
        completed: false,
        codeSnippet: 'function fix() {\n  return false;\n}'
    }
];
class GameService {
    constructor() {
        this.meetingVotes = new Map();
        this.lobbyManager = lobbyService_1.LobbyManager.getInstance();
    }
    startGame(lobbyId) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        if (lobby.players.length < 2)
            throw new Error('Not enough players to start'); // Min 2 for testing
        // if (lobby.status !== 'waiting') throw new Error('Game already started');
        // Assign Roles
        this.assignRoles(lobby);
        // Assign Tasks
        this.assignTasks(lobby);
        // Update Status
        lobby.status = 'in-progress';
        lobby.taskProgress = 0;
        return lobby;
    }
    assignRoles(lobby) {
        const players = lobby.players;
        const imposterCount = Math.min(lobby.settings.imposterCount, Math.floor(players.length / 2));
        // Shuffle players
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        // Assign imposters
        players.forEach((player, index) => {
            if (index < imposterCount) {
                player.role = 'hacker';
            }
            else {
                player.role = 'developer';
            }
        });
    }
    assignTasks(lobby) {
        lobby.players.forEach(player => {
            if (player.role === 'developer') {
                // Assign simplified copy of tasks
                player.tasks = JSON.parse(JSON.stringify(MOCK_TASKS));
            }
            else {
                // Hacker has fake tasks or sabotage abilities (handled later)
                player.tasks = [];
            }
        });
    }
    verifyTask(lobbyId, playerId, taskId, code) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        const player = lobby.players.find(p => p.id === playerId);
        if (!player)
            throw new Error('Player not found');
        const task = (player.tasks || []).find(t => t.id === taskId);
        // CHECK FOR SABOTAGE TASK
        if (lobby.sabotage?.isActive && lobby.sabotage.type === 'meltdown') {
            // If we are in meltdown, checks might be different
            if (lobby.sabotage.tasks[playerId]?.taskId === taskId) {
                // Proceed to verification logic below
            }
            else if (!task) {
                return { success: false, message: 'Task not found' }; // Normal task logic
            }
        }
        else {
            if (!task)
                throw new Error('Task not found');
            if (task.completed)
                return { success: true, message: 'Task already completed' };
        }
        // Verification Logic
        try {
            switch (taskId) {
                // Normal Tasks
                case 'task-1': // Fix Syntax Error
                    // Check if it parses as valid JS
                    new Function(code);
                    // Also check if they actually kept the logic (optional, but simple check)
                    if (!code.includes('console.log'))
                        return { success: false, message: 'You removed the console.log!' };
                    break;
                case 'task-2': // Implement Sum
                    const sumFunc = new Function('a', 'b', code + '\nreturn sum(a, b);');
                    if (sumFunc(2, 3) !== 5 || sumFunc(10, -10) !== 0) {
                        return { success: false, message: 'Incorrect implementation. Try sum(2, 3) -> 5' };
                    }
                    break;
                case 'task-3': // Reverse String
                    const reverseFunc = new Function('str', code + '\nreturn reverse(str);');
                    if (reverseFunc('hello') !== 'olleh' || reverseFunc('world') !== 'dlrow') {
                        return { success: false, message: 'Incorrect implementation.' };
                    }
                    break;
                // Emergency Tasks
                case 'emergency-1':
                    const fix1 = new Function(code + '\nreturn fix();');
                    if (fix1() !== 0)
                        return { success: false, message: 'Must return 0' };
                    break;
                case 'emergency-2':
                    const fix2 = new Function(code + '\nreturn fix();');
                    if (fix2() !== 1)
                        return { success: false, message: 'Must return 1' };
                    break;
                case 'emergency-3':
                    const fix3 = new Function(code + '\nreturn fix();');
                    if (fix3() !== 'FIXED')
                        return { success: false, message: "Must return 'FIXED'" };
                    break;
                case 'emergency-4':
                    const fix4 = new Function(code + '\nreturn fix();');
                    if (fix4() !== true)
                        return { success: false, message: 'Must return true' };
                    break;
                default:
                    return { success: false, message: 'Unknown task' };
            }
            // Handle Sabotage Completion
            if (lobby.sabotage?.isActive && lobby.sabotage.tasks[playerId]?.taskId === taskId) {
                lobby.sabotage.tasks[playerId].completed = true;
                // Check if ALL developers completed
                const developers = lobby.players.filter(p => p.role === 'developer' && p.isAlive);
                const allDone = developers.every(p => lobby.sabotage.tasks[p.id]?.completed);
                if (allDone) {
                    this.resolveSabotage(lobby);
                    return { success: true, message: 'SYSTEM STABILIZED' };
                }
                return { success: true, message: 'Emergency Protocol Executed. Waiting for others...' };
            }
            if (!task)
                throw new Error('Task not found (logic error)'); // Should catch above if valid
            // Mark as completed (Normal flow)
            task.completed = true;
            // Recalculate Progress
            this.updateTaskProgress(lobby);
            return { success: true };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    updateTaskProgress(lobby) {
        let totalTasks = 0;
        let completedTasks = 0;
        lobby.players.forEach(p => {
            if (p.role === 'developer' && p.tasks) {
                totalTasks += p.tasks.length;
                completedTasks += p.tasks.filter(t => t.completed).length;
            }
        });
        if (totalTasks > 0) {
            lobby.taskProgress = Math.floor((completedTasks / totalTasks) * 100);
        }
        else {
            lobby.taskProgress = 0;
        }
        // Win Condition check can go here
        if (lobby.taskProgress >= 100) {
            // Developers Win!
            this.checkWinCondition(lobby);
        }
    }
    checkWinCondition(lobby) {
        if (lobby.status === 'ended')
            return;
        const developers = lobby.players.filter(p => p.role === 'developer' && p.isAlive);
        const hackers = lobby.players.filter(p => p.role === 'hacker' && p.isAlive);
        // Developers Win Condition 1: All Tasks Completed
        if (lobby.taskProgress && lobby.taskProgress >= 100) {
            lobby.status = 'ended';
            lobby.winner = 'developers';
            lobby.winReason = 'Task Completion';
            return;
        }
        // Developers Win Condition 2: All Hackers Ejected
        if (hackers.length === 0) {
            lobby.status = 'ended';
            lobby.winner = 'developers';
            lobby.winReason = 'All Hackers Ejected';
            return;
        }
        // Hackers Win Condition: Hackers >= Developers
        if (hackers.length >= developers.length && hackers.length > 0) {
            lobby.status = 'ended';
            lobby.winner = 'hackers';
            lobby.winReason = 'Sabotage Critical (imposters >= developers)';
            return;
        }
    }
    startMeeting(lobbyId) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        // Check if meeting can be called (cooldowns, etc - MVP skips)
        if (lobby.sabotage?.isActive) {
            throw new Error('Cannot call meeting during Meltdown!');
        }
        lobby.status = 'meeting';
        // Clear any sabotage effects (optional, but good practice)
        return lobby;
    }
    triggerSabotage(lobbyId, type) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        if (lobby.status !== 'in-progress')
            throw new Error('Game not in progress');
        if (type === 'meltdown') {
            const developers = lobby.players.filter(p => p.role === 'developer' && p.isAlive);
            const sabotageTasks = {};
            // Assign unique emergency tasks
            developers.forEach((dev, index) => {
                const taskTemplate = EMERGENCY_TASKS[index % EMERGENCY_TASKS.length];
                sabotageTasks[dev.id] = {
                    taskId: taskTemplate.id,
                    completed: false
                };
                // Also push the actual task object to player's task list so frontend finds it?
                // Or Frontend handles it separately via Overlay? 
                // Better: Push to player tasks temporarily or handle as special case. 
                // For MVP, Frontend MeltdownOverlay will receive the socket event with the task details.
                // But `verifyTask` looks up `player.tasks`. So we MUST add it to `player.tasks`.
                if (!dev.tasks)
                    dev.tasks = [];
                // Check if already exists to avoid dupes?
                if (!dev.tasks.find(t => t.id === taskTemplate.id)) {
                    dev.tasks.push(JSON.parse(JSON.stringify(taskTemplate)));
                }
            });
            lobby.sabotage = {
                isActive: true,
                type: 'meltdown',
                endTime: Date.now() + 45000, // 45 seconds
                tasks: sabotageTasks
            };
        }
        return lobby;
    }
    resolveSabotage(lobby) {
        if (!lobby.sabotage)
            return;
        lobby.sabotage.isActive = false;
        lobby.sabotage.type = null;
        lobby.sabotage.endTime = null;
        // Remove emergency tasks from players?
        // Optional, keeping them marked as completed is fine.
    }
    checkSabotageTimeout(lobbyId) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby || !lobby.sabotage?.isActive)
            return null;
        if (Date.now() > (lobby.sabotage.endTime || 0)) {
            // TIME'S UP - HACKERS WIN
            lobby.status = 'ended';
            lobby.winner = 'hackers';
            lobby.winReason = 'Critical System Meltdown';
            return lobby;
        }
        return null;
    }
    castVote(lobbyId, voterId, targetId) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            return { success: false, message: 'Lobby not found' };
        if (lobby.status !== 'meeting')
            return { success: false, message: 'Not in meeting' };
        const votes = this.meetingVotes.get(lobbyId) || [];
        // Check if already voted
        if (votes.find(v => v.voterId === voterId)) {
            return { success: false, message: 'Already voted' };
        }
        votes.push({ voterId, targetId });
        this.meetingVotes.set(lobbyId, votes);
        // Check if everyone (alive) has voted
        const alivePlayers = lobby.players.filter(p => p.isAlive);
        if (votes.length >= alivePlayers.length) {
            return this.tallyVotes(lobby);
        }
        return { success: true, lobby };
    }
    tallyVotes(lobby) {
        const votes = this.meetingVotes.get(lobby.id) || [];
        const voteCounts = {};
        votes.forEach(v => {
            voteCounts[v.targetId] = (voteCounts[v.targetId] || 0) + 1;
        });
        // Find max
        let maxVotes = 0;
        let candidate = null;
        let tie = false;
        Object.entries(voteCounts).forEach(([target, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                candidate = target;
                tie = false;
            }
            else if (count === maxVotes) {
                tie = true;
            }
        });
        let resultMsg = 'No one was ejected. (Tie or Skip)';
        if (!tie && candidate && candidate !== 'skip') {
            // Eject player
            const player = lobby.players.find(p => p.id === candidate);
            if (player) {
                player.isAlive = false;
                resultMsg = `${player.username} was ejected.`;
                // Check for Imposter Ejection Win
                if (player.role === 'hacker') {
                    // Developers Win
                    lobby.status = 'ended';
                    // We'll handle game end logic in the next step/epic
                }
            }
        }
        else {
            console.log('Tie or Skip win');
        }
        this.meetingVotes.set(lobby.id, []); // Clear votes
        // Check win conditions
        this.checkWinCondition(lobby);
        // Return to game if not ended
        if (lobby.status !== 'ended') {
            lobby.status = 'in-progress';
        }
        this.meetingVotes.set(lobby.id, []); // Clear
        return { success: true, lobby, message: resultMsg };
    }
    resetLobby(lobbyId) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        lobby.status = 'waiting';
        lobby.taskProgress = 0;
        lobby.winner = undefined;
        lobby.winReason = undefined;
        lobby.sabotage = undefined;
        this.meetingVotes.delete(lobbyId);
        // Reset players
        lobby.players.forEach(p => {
            p.role = undefined;
            p.isAlive = true;
            p.tasks = [];
            p.isReady = false;
        });
        return lobby;
    }
}
exports.GameService = GameService;
