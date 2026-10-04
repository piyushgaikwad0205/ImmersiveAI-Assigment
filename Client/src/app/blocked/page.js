'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { taskApi, userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_USERS = [
    { id: 'usr_admin', n: 'Ava Chen', c: '#17171c' },
    { id: 'usr_sarah', n: 'Liam Park', c: '#B0623E' },
    { id: 'usr_mike', n: 'Mia Ross', c: '#6b6b6b' },
    { id: 'usr_noah', n: 'Noah Kim', c: '#c98a6b' }
];

const PRI = {
    high: ['High', '#f7efe9', '#B0623E', '#ebd5c8'],
    medium: ['Medium', '#f4f4f6', '#374151', '#e5e5eb'],
    low: ['Low', '#ffffff', '#6b7280', '#e5e5eb']
};

const ST = {
    todo: ['To Do', '#f1f1f1', '#555555', 'none'],
    progress: ['In Progress', '#17171c', '#ffffff', '#17171c'],
    done: ['Done', '#f7efe9', '#B0623E', '#ebd5c8']
};

const CATS = ['Design', 'Development', 'Bug fix', 'Meeting', 'Research'];

const INITIAL_TASKS = [
    { id: 't1', title: 'Define product requirements', cat: 'Research', desc: '', pri: 'high', status: 'done', users: ['usr_admin'], deps: [], due: 0, prog: 100 },
    { id: 't2', title: 'Design task board UI', cat: 'Design', desc: '', pri: 'high', status: 'progress', users: ['usr_sarah', 'usr_mike'], deps: ['t1'], due: 6, prog: 64 },
    { id: 't3', title: 'Build REST API', cat: 'Development', desc: '', pri: 'medium', status: 'progress', users: ['usr_noah'], deps: ['t1'], due: 9, prog: 38 },
    { id: 't4', title: 'Integrate frontend with API', cat: 'Development', desc: '', pri: 'medium', status: 'todo', users: ['usr_sarah'], deps: ['t2', 't3'], due: 14, prog: 0 },
    { id: 't5', title: 'Write onboarding docs', cat: 'Docs', desc: '', pri: 'low', status: 'todo', users: ['usr_mike'], deps: [], due: 20, prog: 0 }
];

function BlockedContent() {
    const { user: authUser } = useAuth();
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [users, setUsers] = useState(DEFAULT_USERS);
    const [fU, setFU] = useState('all');
    const [pr, setPr] = useState('all');
    const [todayStr, setTodayStr] = useState('');

    const mapBackendToTask = (t) => {
        const statusMap = { 'To Do': 'todo', 'In Progress': 'progress', 'Done': 'done' };
        const priMap = { 'High': 'high', 'Medium': 'medium', 'Low': 'low' };
        return {
            id: t.id,
            title: t.title,
            cat: t.category || 'Development',
            desc: t.description || '',
            pri: priMap[t.priority] || t.priority || 'medium',
            status: statusMap[t.status] || t.status || 'todo',
            users: t.assignedTo ? [t.assignedTo] : (t.users || []),
            deps: t.dependencies || [],
            due: t.due || 7,
            prog: t.status === 'Done' || t.status === 'done' ? 100 : t.status === 'In Progress' || t.status === 'progress' ? 50 : 0
        };
    };

    const syncTasks = useCallback(async () => {
        try {
            const apiTasks = await taskApi.getAllTasks();
            if (Array.isArray(apiTasks) && apiTasks.length > 0) {
                setTasks(apiTasks.map(mapBackendToTask));
            }
            const apiUsers = await userApi.getAllUsers();
            if (Array.isArray(apiUsers) && apiUsers.length > 0) {
                const colorPalette = ['#17171c', '#B0623E', '#6b6b6b', '#c98a6b'];
                setUsers(apiUsers.map((u, i) => ({
                    id: u.id,
                    n: u.name,
                    c: colorPalette[i % colorPalette.length]
                })));
            }
        } catch {
            const saved = localStorage.getItem('taskly-v2');
            if (saved) {
                try {
                    setTasks(JSON.parse(saved));
                } catch {}
            }
        }
    }, []);

    useEffect(() => {
        syncTasks();
        const interval = setInterval(syncTasks, 4000);
        return () => clearInterval(interval);
    }, [syncTasks]);

    useEffect(() => {
        setTodayStr(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }, []);

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        try {
            localStorage.setItem('taskly-v2', JSON.stringify(newTasks));
        } catch {}
    };

    const getTask = (id) => tasks.find(x => x.id === id);
    const getUser = (id) => users.find(x => x.id === id) || { id, n: 'Member', c: '#17171c' };

    const getInitials = (n) => {
        return (n || '')
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getPendingDeps = (k) => {
        return (k.deps || []).filter(d => {
            const depTask = getTask(d);
            return depTask && depTask.status !== 'done';
        });
    };

    const isTaskBlocked = (k) => {
        return k.status !== 'done' && getPendingDeps(k).length > 0;
    };

    const getBlockedTasksCount = (k) => {
        return tasks.filter(x => isTaskBlocked(x) && (x.deps || []).includes(k.id)).length;
    };

    const setStatus = async (id, s) => {
        const k = getTask(id);
        if (!k) return;
        if (s === 'done' && isTaskBlocked(k)) return;

        const newProg = s === 'done' ? 100 : s === 'todo' ? 0 : Math.max(k.prog, 10);
        const updated = tasks.map(t => t.id === id ? { ...t, status: s, prog: newProg } : t);
        saveTasks(updated);

        try {
            const revStatus = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
            await taskApi.updateStatus(id, revStatus[s]);
        } catch {}
    };

    const allBlockedTasks = useMemo(() => {
        return tasks.filter(isTaskBlocked);
    }, [tasks]);

    const filteredBlockedTasks = useMemo(() => {
        return allBlockedTasks.filter(k => {
            const matchUser = fU === 'all' || (k.users && k.users.includes(fU));
            const matchPri = pr === 'all' || k.pri === pr;
            return matchUser && matchPri;
        });
    }, [allBlockedTasks, fU, pr]);

    const blockers = useMemo(() => {
        return tasks
            .filter(k => k.status !== 'done' && getBlockedTasksCount(k) > 0)
            .sort((a, b) => getBlockedTasksCount(b) - getBlockedTasksCount(a));
    }, [tasks]);

    const recentlyUnblocked = useMemo(() => {
        return tasks.filter(k => k.status === 'todo' && k.deps && k.deps.length > 0 && !isTaskBlocked(k));
    }, [tasks]);

    const highPriorityBlockedCount = allBlockedTasks.filter(k => k.pri === 'high').length;

    const loggedInUser = useMemo(() => {
        if (authUser) {
            const match = users.find(u => u.id === authUser.id);
            return {
                id: authUser.id,
                name: authUser.name || match?.n || 'Ava Chen',
                email: authUser.email || `${(authUser.name || 'ava').toLowerCase().replace(/\s+/g, '')}@taskly.app`,
                role: authUser.role || 'Member',
                c: match?.c || '#17171c'
            };
        }
        const first = users[0] || DEFAULT_USERS[0];
        return {
            id: first.id,
            name: first.n,
            email: `${first.n.toLowerCase().replace(/\s+/g, '')}@taskly.app`,
            role: 'Admin',
            c: first.c || '#17171c'
        };
    }, [authUser, users]);

    return (
        <div style={{ minHeight: '100vh', padding: '16px 8px', background: '#ecebe9' }}>
            <div className="frame" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px', background: '#f5f4f2', borderRadius: '24px' }}>
                <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <Link
                        href="/"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#ffffff',
                            border: '1px solid #e7e6e3',
                            display: 'grid',
                            placeItems: 'center',
                            textDecoration: 'none',
                            color: '#17171c',
                            fontWeight: 600
                        }}
                        className="serif"
                    >
                        T.
                    </Link>

                    <Link href="/dashboard" className="tb" style={{ textDecoration: 'none', color: '#17171c' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="6" cy="6" r="4.5"/>
                            <path d="m10 10 3 3"/>
                        </svg>
                        Search
                    </Link>

                    <span className="tb" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="6" cy="5" r="2.5"/>
                            <path d="M1.5 13a4.5 4.5 0 0 1 9 0M12 4v4M10 6h4"/>
                        </svg>
                        Add person
                    </span>

                    <span className="tb" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3.5 10V7a3.5 3.5 0 0 1 7 0v3l1 1.5h-9zM6 13.5h2"/>
                        </svg>
                        Notifications
                    </span>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {todayStr && (
                            <span className="tb" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="1.5" y="2.5" width="11" height="10" rx="2"/>
                                    <path d="M1.5 6h11M4.5 1v3M9.5 1v3"/>
                                </svg>
                                {todayStr}
                            </span>
                        )}
                        <Link href="/dashboard" className="btn" style={{ textDecoration: 'none' }}>
                            Create <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <aside className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '18px', border: '1px solid #ecebe8' }}>
                        <div className="serif" style={{ fontSize: '20px', padding: '4px 8px 16px', fontWeight: 600, color: '#17171c' }}>
                            Taskly.
                        </div>

                        <nav className="nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Link href="/dashboard">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M2 7 7.5 2.5 13 7v6H2z"/>
                                </svg>
                                Dashboard
                            </Link>
                            <Link href="/dashboard?tab=my-tasks">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="2" y="2" width="11" height="11" rx="3"/>
                                    <path d="m5 7.5 2 2 3.5-4"/>
                                </svg>
                                My Tasks
                            </Link>
                            <Link href="/dashboard?tab=new">
                                <svg width="15" height="15" stroke="currentColor" strokeWidth="1.8" fill="none">
                                    <path d="M7.5 2.5v10M2.5 7.5h10"/>
                                </svg>
                                Create Task
                            </Link>
                            <Link href="/blocked" className="on">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="2.5" y="6.5" width="10" height="7" rx="2"/>
                                    <path d="M4.5 6.5V4.5a3 3 0 0 1 6 0v2"/>
                                </svg>
                                Blocked
                            </Link>
                            <a href="#">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="7.5" cy="7.5" r="2"/>
                                    <path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2"/>
                                </svg>
                                Settings
                            </a>
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '28px', marginBottom: '8px', padding: '20px 8px 0', borderTop: '1px solid #ecebe8' }}>
                            <span>Categories</span>
                            <span style={{ cursor: 'pointer' }}>+</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {CATS.map(c => (
                                <Link
                                    key={c}
                                    href={`/dashboard?cat=${encodeURIComponent(c)}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '6px 8px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#4b5563',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: c === 'Design' ? '#B0623E' : '#17171c' }}></span>
                                    {c}
                                </Link>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                            <div style={{ borderRadius: '16px', background: '#17171c', color: '#ffffff', padding: '16px' }}>
                                <div className="serif" style={{ fontSize: '18px', lineHeight: 1.2 }}>Plan before you build.</div>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', lineHeight: 1.4 }}>
                                    Link dependencies so blocked work is flagged automatically.
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '0 4px' }}>
                                <span className="av" style={{ width: '36px', height: '36px', fontSize: '12px', background: loggedInUser.c, color: '#ffffff' }}>
                                    {getInitials(loggedInUser.name)}
                                </span>
                                <div style={{ fontSize: '14px', lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 600, color: '#17171c' }}>{loggedInUser.name}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{loggedInUser.email}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', padding: '0 4px' }}>
                            <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Dashboard</Link> / <span style={{ color: '#17171c', fontWeight: 600 }}>Blocked</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px', padding: '0 4px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: '#17171c' }}>
                                    Blocked
                                </h1>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                    Tasks waiting on unfinished dependencies, and what will unblock them.
                                </p>
                            </div>

                            <select
                                className="tb"
                                value={fU}
                                onChange={(e) => setFU(e.target.value)}
                            >
                                <option value="all">Everyone</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.n}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            <div className="panel" style={{ padding: '16px', background: '#17171c', color: '#ffffff', borderColor: '#17171c' }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Blocked tasks</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>{allBlockedTasks.length}</div>
                            </div>

                            <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Blocking others</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#17171c', marginTop: '4px' }}>{blockers.length}</div>
                            </div>

                            <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>High priority blocked</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#17171c', marginTop: '4px' }}>{highPriorityBlockedCount}</div>
                            </div>
                        </div>

                        <div className="panel" style={{ padding: '20px', marginTop: '16px', background: '#ffffff' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#17171c' }}>Blocked tasks</h2>
                                <div className="seg" style={{ display: 'flex', gap: '4px' }}>
                                    {[
                                        ['all', 'All'],
                                        ['high', 'High'],
                                        ['medium', 'Medium'],
                                        ['low', 'Low']
                                    ].map(([v, label]) => {
                                        const count = v === 'all' ? allBlockedTasks.length : allBlockedTasks.filter(k => k.pri === v).length;
                                        return (
                                            <button
                                                key={v}
                                                className={`tab ${pr === v ? 'on' : ''}`}
                                                onClick={() => setPr(v)}
                                            >
                                                {label}
                                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                {filteredBlockedTasks.length === 0 ? (
                                    <div style={{ border: '1px dashed #d9d8d4', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 600, fontSize: '16px', color: '#17171c' }}>Nothing is blocked</div>
                                        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                                            Every task in this view is free to move.
                                        </p>
                                        <Link href="/dashboard" className="btn" style={{ marginTop: '16px', textDecoration: 'none' }}>
                                            Back to dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    filteredBlockedTasks.map(k => {
                                        const [pl, pb, pc, pbc] = PRI[k.pri] || PRI.medium;
                                        const p = getPendingDeps(k);
                                        const dn = (k.deps || []).length - p.length;
                                        const percent = (k.deps && k.deps.length > 0) ? (dn / k.deps.length) * 100 : 0;

                                        return (
                                            <div
                                                key={k.id}
                                                style={{
                                                    border: '1px solid #ecebe8',
                                                    borderRadius: '16px',
                                                    background: '#faf9f8',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ background: '#ffffff', padding: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', borderBottom: '1px solid #ecebe8' }}>
                                                    <span style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f7efe9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                        <svg width="15" height="15" fill="none" stroke="#B0623E" strokeWidth="1.8">
                                                            <rect x="2.5" y="6.5" width="10" height="7" rx="2"/>
                                                            <path d="M4.5 6.5V4.5a3 3 0 0 1 6 0v2"/>
                                                        </svg>
                                                    </span>

                                                    <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#17171c' }}>
                                                            {k.title}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                            {k.cat || 'General'} &middot; {k.due} days left
                                                        </div>
                                                    </div>

                                                    <span className="tag" style={{ background: pb, color: pc, border: `1.5px solid ${pbc || '#17171c'}` }}>
                                                        {pl}
                                                    </span>

                                                    <div style={{ display: 'flex', marginLeft: '-4px' }}>
                                                        {(k.users || []).map(uid => {
                                                            const uObj = getUser(uid);
                                                            return (
                                                                <span key={uid} className="av" title={uObj.n} style={{ background: uObj.c, width: '28px', height: '28px', fontSize: '10px', marginLeft: '-6px' }}>
                                                                    {getInitials(uObj.n)}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                                        <span>Waiting on {p.length} task{p.length > 1 ? 's' : ''}</span>
                                                        <span>{dn}/{(k.deps || []).length} dependencies done</span>
                                                    </div>

                                                    <div className="bar" style={{ marginTop: '8px' }}>
                                                        <i style={{ width: `${percent}%`, background: '#B0623E' }}></i>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                                        {p.map(depId => {
                                                            const x = getTask(depId);
                                                            if (!x) return null;
                                                            const [sl, sb, sc, sbc] = ST[x.status] || ST.todo;
                                                            const isNestedBlocked = isTaskBlocked(x);

                                                            return (
                                                                <div
                                                                    key={x.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexWrap: 'wrap',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        background: '#ffffff',
                                                                        border: '1px solid #ecebe8',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 12px'
                                                                    }}
                                                                >
                                                                    <span style={{ color: '#d1d5db', fontSize: '16px' }}>↳</span>
                                                                    <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
                                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#17171c' }}>
                                                                            {x.title}
                                                                        </div>
                                                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                                            {isNestedBlocked ? 'Also blocked' : `${x.prog}% complete`}
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ display: 'flex', marginLeft: '-4px' }}>
                                                                        {(x.users || []).map(uid => {
                                                                            const uObj = getUser(uid);
                                                                            return (
                                                                                <span key={uid} className="av" title={uObj.n} style={{ background: uObj.c, width: '28px', height: '28px', fontSize: '10px', marginLeft: '-6px' }}>
                                                                                    {getInitials(uObj.n)}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    <span className="tag" style={{ background: sb, color: sc, border: sbc === 'none' ? 'none' : `1.5px solid ${sbc || '#17171c'}` }}>
                                                                        {sl}
                                                                    </span>

                                                                    <button
                                                                        disabled={isNestedBlocked}
                                                                        onClick={() => setStatus(x.id, 'done')}
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            fontWeight: 600,
                                                                            borderRadius: '8px',
                                                                            padding: '6px 12px',
                                                                            border: isNestedBlocked ? '1px solid #ecebe8' : '1px solid #17171c',
                                                                            background: 'transparent',
                                                                            color: isNestedBlocked ? '#d1d5db' : '#17171c',
                                                                            cursor: isNestedBlocked ? 'not-allowed' : 'pointer'
                                                                        }}
                                                                    >
                                                                        Mark done
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </main>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                        <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Biggest blockers</h3>
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Finish these first to unblock the most work
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {blockers.length === 0 ? (
                                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>No blockers.</p>
                                ) : (
                                    blockers.slice(0, 4).map(k => {
                                        const count = getBlockedTasksCount(k);
                                        return (
                                            <div
                                                key={k.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    border: '1px solid #ecebe8',
                                                    borderRadius: '12px',
                                                    padding: '12px'
                                                }}
                                            >
                                                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#17171c', color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                                                    {count}
                                                </span>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#17171c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {k.title}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                        Blocks {count} task{count > 1 ? 's' : ''} &middot; {ST[k.status] ? ST[k.status][0] : k.status}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Recently unblocked</h3>
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                All dependencies done, ready to start
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {recentlyUnblocked.length === 0 ? (
                                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>None yet.</p>
                                ) : (
                                    recentlyUnblocked.slice(0, 4).map(k => (
                                        <div
                                            key={k.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                border: '1px solid #ecebe8',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                        >
                                            <span style={{ width: '6px', height: '32px', borderRadius: '999px', background: '#B0623E', flexShrink: 0 }}></span>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#17171c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {k.title}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    {(k.deps || []).length} dependencies done
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ borderRadius: '18px', background: '#17171c', color: '#ffffff', padding: '16px' }}>
                            <div className="serif" style={{ fontSize: '18px', lineHeight: 1.2 }}>How blocking works</div>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', lineHeight: 1.5 }}>
                                A task is blocked while any task it depends on is not Done. It can’t be marked Done until every dependency is finished.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function BlockedPage() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading blocked tasks...</div>}>
            <BlockedContent />
        </Suspense>
    );
}
