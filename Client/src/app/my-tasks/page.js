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

function MyTasksContent() {
    const { user: authUser } = useAuth();
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [users, setUsers] = useState(DEFAULT_USERS);
    const [me, setMe] = useState('usr_admin');
    const [tab, setTab] = useState('all');
    const [fP, setFP] = useState('all');
    const [q, setQ] = useState('');
    const [todayStr, setTodayStr] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

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
                const loadedUsers = apiUsers.map((u, i) => ({
                    id: u.id,
                    n: u.name,
                    c: colorPalette[i % colorPalette.length]
                }));
                setUsers(loadedUsers);
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
        const savedMe = localStorage.getItem('taskly-me') || (authUser ? authUser.id : null);
        if (savedMe) setMe(savedMe);

        syncTasks();
        const interval = setInterval(syncTasks, 4000);
        return () => clearInterval(interval);
    }, [syncTasks, authUser]);

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
    const currentUser = users.find(x => x.id === me) || users[0] || { id: 'usr_admin', n: 'Ava Chen', c: '#17171c' };

    const getInitials = (n) => {
        return (n || '')
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isTaskBlocked = (k) => {
        return k.status !== 'done' && (k.deps || []).some(d => {
            const depTask = getTask(d);
            return depTask && depTask.status !== 'done';
        });
    };

    const handleUserChange = (newUserId) => {
        setMe(newUserId);
        try {
            localStorage.setItem('taskly-me', newUserId);
        } catch {}
    };

    const setStatus = async (id, s) => {
        const k = getTask(id);
        if (!k) return;
        if (s === 'done' && isTaskBlocked(k)) {
            const uncompleted = (k.deps || [])
                .map(d => getTask(d))
                .filter(d => d && d.status !== 'done')
                .map(d => d.title)
                .join(', ');
            alert('Finish its dependencies first: ' + uncompleted);
            return;
        }

        const newProg = s === 'done' ? 100 : s === 'todo' ? 0 : Math.max(k.prog, 10);
        const updated = tasks.map(t => t.id === id ? { ...t, status: s, prog: newProg } : t);
        saveTasks(updated);

        try {
            const revStatus = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
            await taskApi.updateStatus(id, revStatus[s]);
        } catch {}
    };

    const myTasks = useMemo(() => {
        return tasks.filter(k => k.users && k.users.includes(me));
    }, [tasks, me]);

    const todoCount = myTasks.filter(k => k.status === 'todo').length;
    const progressCount = myTasks.filter(k => k.status === 'progress').length;
    const doneCount = myTasks.filter(k => k.status === 'done').length;
    const completionPercent = myTasks.length ? Math.round((doneCount / myTasks.length) * 100) : 0;

    const filteredList = useMemo(() => {
        const po = { high: 0, medium: 1, low: 2 };
        return myTasks
            .filter(k => {
                const matchTab = tab === 'all' || k.status === tab;
                const matchPri = fP === 'all' || k.pri === fP;
                const matchQuery = ((k.title || '') + (k.cat || '')).toLowerCase().includes(q.toLowerCase());
                return matchTab && matchPri && matchQuery;
            })
            .sort((a, b) => (a.status === 'done') - (b.status === 'done') || po[a.pri] - po[b.pri]);
    }, [myTasks, tab, fP, q]);

    const openTasks = useMemo(() => {
        return myTasks.filter(k => k.status !== 'done');
    }, [myTasks]);

    const upNextTasks = useMemo(() => {
        const po = { high: 0, medium: 1, low: 2 };
        return openTasks
            .filter(k => !isTaskBlocked(k))
            .sort((a, b) => po[a.pri] - po[b.pri])
            .slice(0, 4);
    }, [openTasks]);

    const waitingTasks = useMemo(() => {
        return openTasks.filter(isTaskBlocked);
    }, [openTasks]);

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

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="tb"
                            style={{ cursor: 'pointer', border: '1px solid #e7e6e3', background: notificationsOpen ? '#f0f0f4' : '#fff' }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M3.5 10V7a3.5 3.5 0 0 1 7 0v3l1 1.5h-9zM6 13.5h2"/>
                            </svg>
                            Notifications
                            {waitingTasks.length > 0 && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B0623E', display: 'inline-block' }}></span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <div
                                className="box pop"
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '40px',
                                    width: '300px',
                                    padding: '16px',
                                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
                                    zIndex: 100,
                                    background: '#ffffff'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#17171c' }}>Your Notifications</span>
                                    <span style={{ fontSize: '11px', background: '#f7efe9', color: '#B0623E', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                                        {waitingTasks.length} blocked
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {waitingTasks.map(t => (
                                        <div key={t.id} style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px' }}>
                                            <div style={{ fontWeight: 600, color: '#991b1b' }}>Blocked Task</div>
                                            <div style={{ color: '#7f1d1d' }}>{t.title} is awaiting dependencies.</div>
                                        </div>
                                    ))}
                                    {waitingTasks.length === 0 && (
                                        <div style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
                                            All assigned tasks are ready to work on!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
                            <Link href="/my-tasks" className="on">
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
                            <Link href="/blocked">
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
                                <span className="av" style={{ width: '36px', height: '36px', fontSize: '12px', background: currentUser.c }}>
                                    {getInitials(currentUser.n)}
                                </span>
                                <div style={{ fontSize: '14px', lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 600, color: '#17171c' }}>{currentUser.n}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{currentUser.n.toLowerCase().replace(' ', '')}@taskly.app</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', padding: '0 4px' }}>
                            <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Dashboard</Link> / <span style={{ color: '#17171c', fontWeight: 600 }}>My Tasks</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px', padding: '0 4px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: '#17171c' }}>
                                My Tasks
                            </h1>

                            <label className="tb" style={{ cursor: 'pointer' }}>
                                <span style={{ color: '#6b7280' }}>Viewing as</span>
                                <select
                                    id="me"
                                    className="outline-none bg-transparent font-semibold"
                                    style={{ border: 'none', cursor: 'pointer', color: '#17171c' }}
                                    value={me}
                                    onChange={(e) => handleUserChange(e.target.value)}
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.n}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            <div className="panel" style={{ padding: '16px', background: '#17171c', color: '#ffffff', borderColor: '#17171c' }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Assigned</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>{myTasks.length}</div>
                            </div>

                            <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>To Do</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#17171c', marginTop: '4px' }}>{todoCount}</div>
                            </div>

                            <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>In Progress</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#17171c', marginTop: '4px' }}>{progressCount}</div>
                            </div>

                            <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Done</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#17171c', marginTop: '4px' }}>{doneCount}</div>
                            </div>
                        </div>

                        <div className="panel" style={{ padding: '20px', marginTop: '16px', background: '#ffffff' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div className="seg" style={{ display: 'flex', gap: '4px' }}>
                                    {[
                                        ['all', 'All', myTasks.length],
                                        ['todo', 'To Do', todoCount],
                                        ['progress', 'In Progress', progressCount],
                                        ['done', 'Done', doneCount]
                                    ].map(([v, label, count]) => (
                                        <button
                                            key={v}
                                            className={`tab ${tab === v ? 'on' : ''}`}
                                            onClick={() => setTab(v)}
                                        >
                                            {label}
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{count}</span>
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <select
                                        className="tb outline-none"
                                        value={fP}
                                        onChange={(e) => setFP(e.target.value)}
                                    >
                                        <option value="all">All priorities</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <input
                                        className="tb outline-none"
                                        style={{ width: '160px' }}
                                        placeholder="Search"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {filteredList.length === 0 ? (
                                    <div style={{ border: '1px dashed #d9d8d4', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 600, fontSize: '16px', color: '#17171c' }}>Nothing here</div>
                                        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                                            No tasks match this view.
                                        </p>
                                        <Link href="/dashboard?tab=new" className="btn" style={{ marginTop: '16px', textDecoration: 'none' }}>
                                            Create a task
                                        </Link>
                                    </div>
                                ) : (
                                    filteredList.map(k => {
                                        const [pl, pb, pc, pbc] = PRI[k.pri] || PRI.medium;
                                        const [sl, sb, sc, sbc] = ST[k.status] || ST.todo;
                                        const b = isTaskBlocked(k);
                                        const isDone = k.status === 'done';
                                        const completedDeps = (k.deps || []).filter(d => {
                                            const dep = getTask(d);
                                            return dep && dep.status === 'done';
                                        }).length;

                                        return (
                                            <div
                                                key={k.id}
                                                className="trow flex-wrap"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '14px',
                                                    border: '1px solid #ecebe8',
                                                    borderRadius: '14px',
                                                    background: '#ffffff',
                                                    padding: '14px 16px'
                                                }}
                                            >
                                                <button
                                                    className={`chk ${isDone ? 'on' : ''}`}
                                                    disabled={b}
                                                    title={b ? 'Blocked by dependencies' : 'Toggle done'}
                                                    onClick={() => setStatus(k.id, isDone ? 'todo' : 'done')}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '7px',
                                                        border: isDone ? '1.5px solid #B0623E' : '1.5px solid #d1d5db',
                                                        background: isDone ? '#B0623E' : '#ffffff',
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        cursor: b ? 'not-allowed' : 'pointer',
                                                        opacity: b ? 0.4 : 1
                                                    }}
                                                >
                                                    {isDone && (
                                                        <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.4">
                                                            <path d="m2 5.5 2.5 2.5 4.5-5"/>
                                                        </svg>
                                                    )}
                                                </button>

                                                <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '15px', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#9ca3af' : '#17171c' }}>
                                                        {k.title}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                        {k.cat || 'General'}
                                                        {(k.deps || []).length > 0 && (
                                                            <span> &middot; {completedDeps}/{(k.deps || []).length} dependencies done</span>
                                                        )}
                                                        {b && (
                                                            <span style={{ color: '#B0623E', fontWeight: 600 }}> &middot; Blocked</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <span className="tag" style={{ background: pb, color: pc, border: `1.5px solid ${pbc || '#17171c'}` }}>
                                                    {pl}
                                                </span>

                                                <select
                                                    value={k.status}
                                                    onChange={(e) => setStatus(k.id, e.target.value)}
                                                    className="tag outline-none"
                                                    style={{ background: sb, color: sc, border: sbc === 'none' ? 'none' : `1.5px solid ${sbc || '#17171c'}`, cursor: 'pointer' }}
                                                >
                                                    {Object.entries(ST).map(([s, [label]]) => (
                                                        <option key={s} value={s} disabled={s === 'done' && b}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <span style={{ fontSize: '12px', color: '#9ca3af', width: '80px' }}>
                                                    {isDone ? 'Completed' : `${k.due} days left`}
                                                </span>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '112px' }}>
                                                    <div className="bar" style={{ flex: 1 }}>
                                                        <i style={{ width: `${k.prog}%` }}></i>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#9ca3af', width: '32px', textAlign: 'right' }}>
                                                        {k.prog}%
                                                    </span>
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
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Your progress</h3>
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Completed out of all assigned
                            </p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '16px' }}>
                                <span className="serif" style={{ fontSize: '44px', fontWeight: 600, color: '#17171c', lineHeight: 1 }}>
                                    {completionPercent}%
                                </span>
                                <span style={{ fontSize: '14px', color: '#9ca3af', paddingBottom: '6px' }}>
                                    complete
                                </span>
                            </div>
                            <div className="bar" style={{ marginTop: '12px' }}>
                                <i style={{ width: `${completionPercent}%`, background: '#B0623E' }}></i>
                            </div>
                        </div>

                        <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Up next</h3>
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Ready to start, nothing blocking
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {upNextTasks.length === 0 ? (
                                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>All clear.</p>
                                ) : (
                                    upNextTasks.map(k => {
                                        const [, , pc] = PRI[k.pri] || PRI.medium;
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
                                                <span style={{ width: '6px', height: '32px', borderRadius: '999px', background: pc, flexShrink: 0 }}></span>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#17171c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {k.title}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                        {k.due} days left
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="panel" style={{ padding: '16px', background: '#ffffff' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Waiting on others</h3>
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Blocked by unfinished dependencies
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                {waitingTasks.length === 0 ? (
                                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Nothing blocked.</p>
                                ) : (
                                    waitingTasks.map(k => (
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
                                                    {k.due} days left &middot; Blocked
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function MyTasksPage() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading your tasks...</div>}>
            <MyTasksContent />
        </Suspense>
    );
}
