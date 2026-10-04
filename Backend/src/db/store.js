const { getIsoTimestamp } = require('../utils/helpers');

class MemoryStore {
    constructor() {
        this.users = new Map();
        this.tasks = new Map();
        this.tokens = new Map();
        this.seedInitialData();
    }

    seedInitialData() {
        const defaultUsers = [
            {
                id: 'u1',
                name: 'Ava Chen',
                email: 'ava@taskly.app',
                color: '#17171c',
                role: 'admin',
                createdAt: getIsoTimestamp()
            },
            {
                id: 'u2',
                name: 'Liam Park',
                email: 'liam@taskly.app',
                color: '#B0623E',
                role: 'developer',
                createdAt: getIsoTimestamp()
            },
            {
                id: 'u3',
                name: 'Mia Ross',
                email: 'mia@taskly.app',
                color: '#6b6b6b',
                role: 'designer',
                createdAt: getIsoTimestamp()
            },
            {
                id: 'u4',
                name: 'Noah Kim',
                email: 'noah@taskly.app',
                color: '#c98a6b',
                role: 'developer',
                createdAt: getIsoTimestamp()
            }
        ];

        defaultUsers.forEach(user => {
            this.users.set(user.id, user);
            this.tokens.set(`token_${user.id}`, user.id);
        });

        const initialTasks = [
            {
                id: 't1',
                title: 'Define product requirements',
                description: 'Specify user personas, user stories and requirements for MVP launch.',
                category: 'Research',
                priority: 'High',
                status: 'Done',
                assignedTo: 'u1',
                users: ['u1'],
                dependencies: [],
                due: 0,
                progress: 100,
                createdBy: 'u1',
                createdAt: getIsoTimestamp(),
                updatedAt: getIsoTimestamp()
            },
            {
                id: 't2',
                title: 'Design task board UI',
                description: 'Create Figma design mockups and design system components.',
                category: 'Design',
                priority: 'High',
                status: 'In Progress',
                assignedTo: 'u2',
                users: ['u2', 'u3'],
                dependencies: ['t1'],
                due: 6,
                progress: 64,
                createdBy: 'u1',
                createdAt: getIsoTimestamp(),
                updatedAt: getIsoTimestamp()
            },
            {
                id: 't3',
                title: 'Build REST API',
                description: 'Implement Express API endpoints with dependency verification and cycle detection.',
                category: 'Development',
                priority: 'Medium',
                status: 'In Progress',
                assignedTo: 'u4',
                users: ['u4'],
                dependencies: ['t1'],
                due: 9,
                progress: 38,
                createdBy: 'u1',
                createdAt: getIsoTimestamp(),
                updatedAt: getIsoTimestamp()
            },
            {
                id: 't4',
                title: 'Integrate frontend with API',
                description: 'Connect Next.js frontend pages with live Express backend endpoints.',
                category: 'Development',
                priority: 'Medium',
                status: 'To Do',
                assignedTo: 'u2',
                users: ['u2'],
                dependencies: ['t2', 't3'],
                due: 14,
                progress: 0,
                createdBy: 'u1',
                createdAt: getIsoTimestamp(),
                updatedAt: getIsoTimestamp()
            },
            {
                id: 't5',
                title: 'Write onboarding docs',
                description: 'Document architecture, API reference, and team onboarding guides.',
                category: 'Docs',
                priority: 'Low',
                status: 'To Do',
                assignedTo: 'u3',
                users: ['u3'],
                dependencies: [],
                due: 20,
                progress: 0,
                createdBy: 'u1',
                createdAt: getIsoTimestamp(),
                updatedAt: getIsoTimestamp()
            }
        ];

        initialTasks.forEach(task => {
            this.tasks.set(task.id, task);
        });
    }
}

if (!global.__MEMORY_STORE__) {
    global.__MEMORY_STORE__ = new MemoryStore();
}

module.exports = global.__MEMORY_STORE__;
