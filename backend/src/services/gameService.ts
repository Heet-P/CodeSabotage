import { Lobby, Player, Task } from '../types';
import { LobbyManager } from './lobbyService';

// Mock Tasks for now
const MOCK_TASKS: Task[] = [
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

export class GameService {
    private lobbyManager: LobbyManager;

    constructor() {
        this.lobbyManager = LobbyManager.getInstance();
    }

    public startGame(lobbyId: string): Lobby {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby) throw new Error('Lobby not found');
        if (lobby.players.length < 2) throw new Error('Not enough players to start'); // Min 2 for testing
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

    private assignRoles(lobby: Lobby) {
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
            } else {
                player.role = 'developer';
            }
        });
    }

    private assignTasks(lobby: Lobby) {
        lobby.players.forEach(player => {
            if (player.role === 'developer') {
                // Assign simplified copy of tasks
                player.tasks = JSON.parse(JSON.stringify(MOCK_TASKS));
            } else {
                // Hacker has fake tasks or sabotage abilities (handled later)
                player.tasks = [];
            }
        });
    }


    public verifyTask(lobbyId: string, playerId: string, taskId: string, code: string): { success: boolean, message?: string } {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby) throw new Error('Lobby not found');

        const player = lobby.players.find(p => p.id === playerId);
        if (!player) throw new Error('Player not found');

        const task = (player.tasks || []).find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');
        if (task.completed) return { success: true, message: 'Task already completed' };

        // Verification Logic
        try {
            switch (taskId) {
                case 'task-1': // Fix Syntax Error
                    // Check if it parses as valid JS
                    new Function(code);
                    // Also check if they actually kept the logic (optional, but simple check)
                    if (!code.includes('console.log')) return { success: false, message: 'You removed the console.log!' };
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
                default:
                    return { success: false, message: 'Unknown task' };
            }

            // Mark as completed
            task.completed = true;

            // Recalculate Progress
            this.updateTaskProgress(lobby);

            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    private updateTaskProgress(lobby: Lobby) {
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
        } else {
            lobby.taskProgress = 0;
        }

        // Win Condition check can go here
        if (lobby.taskProgress >= 100) {
            // Developers Win!
            this.checkWinCondition(lobby);
        }
    }

    private checkWinCondition(lobby: Lobby) {
        if (lobby.status === 'ended') return;

        const developers = lobby.players.filter(p => p.role === 'developer' && p.isAlive);
        const hackers = lobby.players.filter(p => p.role === 'hacker' && p.isAlive);

        // Developers Win Condition 1: All Tasks Completed
        if (lobby.taskProgress && lobby.taskProgress >= 100) {
            lobby.status = 'ended';
            (lobby as any).winner = 'developers';
            (lobby as any).winReason = 'Task Completion';
            return;
        }

        // Developers Win Condition 2: All Hackers Ejected
        if (hackers.length === 0) {
            lobby.status = 'ended';
            (lobby as any).winner = 'developers';
            (lobby as any).winReason = 'All Hackers Ejected';
            return;
        }

        // Hackers Win Condition: Hackers >= Developers
        if (hackers.length >= developers.length && hackers.length > 0) {
            lobby.status = 'ended';
            (lobby as any).winner = 'hackers';
            (lobby as any).winReason = 'Sabotage Critical (imposters >= developers)';
            return;
        }
    }

    public startMeeting(lobbyId: string): Lobby {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby) throw new Error('Lobby not found');

        // Check if meeting can be called (cooldowns, etc - MVP skips)
        lobby.status = 'meeting';

        // Clear any sabotage effects (optional, but good practice)

        return lobby;
    }

    private meetingVotes: Map<string, { voterId: string, targetId: string }[]> = new Map();

    public castVote(lobbyId: string, voterId: string, targetId: string | 'skip'): { success: boolean, lobby?: Lobby, message?: string } {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby) return { success: false, message: 'Lobby not found' };
        if (lobby.status !== 'meeting') return { success: false, message: 'Not in meeting' };

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

    private tallyVotes(lobby: Lobby): { success: boolean, lobby: Lobby, message: string } {
        const votes = this.meetingVotes.get(lobby.id) || [];
        const voteCounts: { [key: string]: number } = {};

        votes.forEach(v => {
            voteCounts[v.targetId] = (voteCounts[v.targetId] || 0) + 1;
        });

        // Find max
        let maxVotes = 0;
        let candidate: string | null = null;
        let tie = false;

        Object.entries(voteCounts).forEach(([target, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                candidate = target;
                tie = false;
            } else if (count === maxVotes) {
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
        } else {
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

    public resetLobby(lobbyId: string): Lobby {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (!lobby) throw new Error('Lobby not found');

        lobby.status = 'waiting';
        lobby.taskProgress = 0;
        (lobby as any).winner = undefined;
        (lobby as any).winReason = undefined;
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
