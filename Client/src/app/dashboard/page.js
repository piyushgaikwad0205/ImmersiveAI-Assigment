'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

const CATS = [
    ['Design', '#B0623E', 'M3 13 13 3M9 3h4v4'],
    ['Development', '#B0623E', 'm5 4-3 4 3 4M11 4l3 4-3 4'],
    ['Bug fix', '#B0623E', 'M8 2v12M2 8h12'],
    ['Meeting', '#B0623E', 'M2 4h12v9H2zM5 2v3M11 2v3'],
    ['Research', '#B0623E', 'M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2m4 9 3 3'],
    ['Review', '#B0623E', 'm3 8 3 3 7-7'],
    ['Docs', '#B0623E', 'M4 2h6l3 3v9H4z'],
    ['Release', '#B0623E', 'M8 2l4 6H4zM8 8v6']
];

const INITIAL_TASKS = [
    { id: 't1', title: 'Define product requirements', cat: 'Research', desc: '', pri: 'high', status: 'done', users: ['usr_admin'], deps: [], due: 0, prog: 100 },
    { id: 't2', title: 'Design task board UI', cat: 'Design', desc: '', pri: 'high', status: 'progress', users: ['usr_sarah', 'usr_mike'], deps: ['t1'], due: 6, prog: 64 },
    { id: 't3', title: 'Build REST API', cat: 'Development', desc: '', pri: 'medium', status: 'progress', users: ['usr_noah'], deps: ['t1'], due: 9, prog: 38 },
    { id: 't4', title: 'Integrate frontend with API', cat: 'Development', desc: '', pri: 'medium', status: 'todo', users: ['usr_sarah'], deps: ['t2', 't3'], due: 14, prog: 0 },
    { id: 't5', title: 'Write onboarding docs', cat: 'Docs', desc: '', pri: 'low', status: 'todo', users: ['usr_mike'], deps: [], due: 20, prog: 0 }
];

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: authUser, logout } = useAuth();

    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [users, setUsers] = useState(DEFAULT_USERS);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [fP, setFP] = useState('all');
    const [fU, setFU] = useState('all');
    const [fS, setFS] = useState('all');
    const [q, setQ] = useState('');
    const [sortBy, setSortBy] = useState('pri');
    const [hideDone, setHideDone] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formCat, setFormCat] = useState('');
    const [formDue, setFormDue] = useState(7);
    const [formDesc, setFormDesc] = useState('');
    const [formPri, setFormPri] = useState('medium');
    const [formStatus, setFormStatus] = useState('todo');
    const [formUsers, setFormUsers] = useState([]);
    const [formDeps, setFormDeps] = useState([]);
    const [formErr, setFormErr] = useState('');

    const [dragOverCol, setDragOverCol] = useState(null);

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

    const mapTaskToBackend = (t) => {
        const revStatus = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
        const revPri = { high: 'High', medium: 'Medium', low: 'Low' };
        return {
            title: t.title,
            description: t.desc,
            priority: revPri[t.pri] || 'Medium',
            status: revStatus[t.status] || 'To Do',
            assignedTo: t.users && t.users.length > 0 ? t.users[0] : null,
            dependencies: t.deps || []
        };
    };

    const syncWithBackend = useCallback(async () => {
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
        syncWithBackend();
        const interval = setInterval(syncWithBackend, 4000);
        return () => clearInterval(interval);
    }, [syncWithBackend]);

    useEffect(() => {
        const catParam = searchParams.get('cat');
        const navParam = searchParams.get('tab');
        if (catParam) {
            openModal(null, 'todo', catParam);
        }
        if (navParam) {
            handleNavClick(navParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('q')?.focus();
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        try {
            localStorage.setItem('taskly-v2', JSON.stringify(newTasks));
        } catch {}
    };

    const getUser = (id) => users.find(x => x.id === id) || { id, n: 'Member', c: '#17171c' };
    const getTask = (id) => tasks.find(x => x.id === id);

    const isBlocked = (k) => {
        return k.status !== 'done' && k.deps.some(d => {
            const depTask = getTask(d);
            return depTask && depTask.status !== 'done';
        });
    };

    const getInitials = (n) => {
        return (n || '')
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const reaches = (from, targetId) => {
        const k = getTask(from);
        if (!k) return false;
        if (from === targetId) return true;
        return k.deps.some(d => reaches(d, targetId));
    };

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (nav === 'dashboard') {
            setFS('all');
            setFU('all');
        } else if (nav === 'my-tasks') {
            setFS('all');
            setFU(loggedInUser.id);
        } else if (nav === 'blocked') {
            setFS('blocked');
            setFU('all');
        } else if (nav === 'new') {
            openModal();
        }
        setSidebarOpen(false);
    };

    const handleMove = async (id, newStatus) => {
        const k = getTask(id);
        if (!k) return;

        if (newStatus === 'done' && isBlocked(k)) {
            const blockingTitles = k.deps
                .map(d => getTask(d))
                .filter(d => d && d.status !== 'done')
                .map(d => d.title)
                .join(', ');
            alert('Finish its dependencies first: ' + blockingTitles);
            return;
        }

        const newProg = newStatus === 'done' ? 100 : newStatus === 'todo' ? 0 : Math.max(k.prog, 10);
        const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus, prog: newProg } : t);
        saveTasks(updated);

        try {
            const revStatus = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
            await taskApi.updateStatus(id, revStatus[newStatus]);
        } catch {}
    };

    const openModal = (id = null, defaultStatus = 'todo', defaultCat = '') => {
        setFormErr('');
        if (id) {
            const k = getTask(id);
            if (k) {
                setEditingTask(k);
                setFormTitle(k.title);
                setFormCat(k.cat || '');
                setFormDue(k.due || 7);
                setFormDesc(k.desc || '');
                setFormPri(k.pri || 'medium');
                setFormStatus(k.status || 'todo');
                setFormUsers(k.users || []);
                setFormDeps(k.deps || []);
            }
        } else {
            setEditingTask(null);
            setFormTitle('');
            setFormCat(defaultCat || '');
            setFormDue(7);
            setFormDesc('');
            setFormPri('medium');
            setFormStatus(defaultStatus || 'todo');
            setFormUsers(users.length > 0 ? [users[0].id] : []);
            setFormDeps([]);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTask(null);
        setFormErr('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErr('');

        if (!formTitle.trim()) {
            setFormErr('Task title is required');
            return;
        }

        if (formStatus === 'done') {
            const uncompleted = formDeps.some(d => {
                const depTask = getTask(d);
                return depTask && depTask.status !== 'done';
            });
            if (uncompleted) {
                setFormErr('Can’t be Done until all dependencies are Done.');
                return;
            }
        }

        const taskData = {
            title: formTitle.trim(),
            cat: formCat.trim() || 'General',
            due: Number(formDue) || 0,
            desc: formDesc.trim(),
            pri: formPri,
            status: formStatus,
            users: formUsers,
            deps: formDeps,
            prog: formStatus === 'done' ? 100 : formStatus === 'progress' ? 10 : 0
        };

        if (editingTask) {
            const updated = tasks.map(t => {
                if (t.id === editingTask.id) {
                    const prog = t.status !== taskData.status
                        ? (taskData.status === 'done' ? 100 : taskData.status === 'todo' ? 0 : Math.max(t.prog, 10))
                        : t.prog;
                    return { ...t, ...taskData, prog };
                }
                return t;
            });
            saveTasks(updated);
            try {
                await taskApi.updateTask(editingTask.id, mapTaskToBackend(taskData));
            } catch {}
        } else {
            const newId = 't_' + Date.now();
            const newTask = { id: newId, ...taskData };
            const updated = [...tasks, newTask];
            saveTasks(updated);
            try {
                await taskApi.createTask(mapTaskToBackend(newTask));
            } catch {}
        }

        closeModal();
    };

    const handleDelete = async () => {
        if (!editingTask) return;
        const id = editingTask.id;
        const updated = tasks
            .filter(x => x.id !== id)
            .map(x => ({ ...x, deps: x.deps.filter(d => d !== id) }));
        saveTasks(updated);
        closeModal();
        try {
            await taskApi.deleteTask(id);
        } catch {}
    };

    const handleCategoryClick = (catName) => {
        openModal(null, 'todo', catName);
    };

    const doneCount = tasks.filter(x => x.status === 'done').length;
    const progressPercent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
    const blockedCount = tasks.filter(isBlocked).length;

    const filteredTasks = useMemo(() => {
        const po = { high: 0, medium: 1, low: 2 };
        let list = tasks.filter(x => {
            const matchPri = fP === 'all' || x.pri === fP;
            const matchUser = fU === 'all' || (x.users && x.users.includes(fU));
            const matchBlocked = fS !== 'blocked' || isBlocked(x);
            const matchSearch = ((x.title || '') + (x.cat || '')).toLowerCase().includes(q.toLowerCase());
            return matchPri && matchUser && matchBlocked && matchSearch;
        });

        list.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'prog') return b.prog - a.prog;
            return po[a.pri] - po[b.pri];
        });

        return list;
    }, [tasks, fP, fU, fS, q, sortBy]);

    const availableDependencyOptions = tasks.filter(
        x => !editingTask || (x.id !== editingTask.id && !reaches(x.id, editingTask.id))
    );

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
        <div style={{ minHeight: '100vh', width: '100%', background: '#fbfbfe', display: 'flex' }}>
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 30 }}
                />
            )}

            <aside
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '260px',
                    flexShrink: 0,
                    borderRight: '1px solid #f0f0f4',
                    padding: '24px 20px',
                    overflowY: 'auto',
                    zIndex: 40
                }}
            >
                <Link href="/" style={{ textDecoration: 'none', color: '#17171c' }}>
                    <span className="serif" style={{ fontSize: '24px', paddingLeft: '8px', paddingTop: '4px', fontWeight: 600 }}>Taskly.</span>
                </Link>

                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '32px', marginBottom: '8px', paddingLeft: '8px' }}>Menu</div>
                    <nav className="nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <a
                            onClick={() => handleNavClick('dashboard')}
                            className={activeNav === 'dashboard' ? 'on' : ''}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="5" height="5" rx="1"/>
                                <rect x="9" y="2" width="5" height="5" rx="1"/>
                                <rect x="2" y="9" width="5" height="5" rx="1"/>
                                <rect x="9" y="9" width="5" height="5" rx="1"/>
                            </svg>
                            Dashboard
                        </a>
                        <a
                            onClick={() => handleNavClick('my-tasks')}
                            className={activeNav === 'my-tasks' ? 'on' : ''}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="12" height="12" rx="3"/>
                                <path d="m5 8 2 2 4-4"/>
                            </svg>
                            My Tasks
                        </a>
                        <a
                            onClick={() => handleNavClick('new')}
                            className={activeNav === 'new' ? 'on' : ''}
                        >
                            <svg width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <path d="M8 3v10M3 8h10"/>
                            </svg>
                            Create Task
                        </a>
                        <a
                            onClick={() => handleNavClick('blocked')}
                            className={activeNav === 'blocked' ? 'on' : ''}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="7" width="10" height="7" rx="2"/>
                                <path d="M5 7V5a3 3 0 0 1 6 0v2"/>
                            </svg>
                            Blocked
                            {blockedCount > 0 && (
                                <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#f7efe9', color: '#B0623E', borderRadius: '6px', padding: '2px 6px', fontWeight: 700 }}>
                                    {blockedCount}
                                </span>
                            )}
                        </a>
                    </nav>

                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '32px', marginBottom: '8px', paddingLeft: '8px' }}>Team</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {users.map(u => {
                            const pendingCount = tasks.filter(k => k.users && k.users.includes(u.id) && k.status !== 'done').length;
                            const isSelected = fU === u.id;
                            return (
                                <button
                                    key={u.id}
                                    onClick={() => setFU(fU === u.id ? 'all' : u.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '6px 8px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: isSelected ? '#f6f6f6' : 'transparent',
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected ? '#17171c' : '#4b5563',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span className="av" style={{ background: u.c }}>
                                        {getInitials(u.n)}
                                    </span>
                                    <span>{u.n}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>
                                        {pendingCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '32px', borderRadius: '16px', padding: '16px', background: '#17171c', color: '#ffffff' }}>
                        <div className="serif" style={{ fontSize: '18px', lineHeight: 1.2 }}>Team progress</div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                            {doneCount} of {tasks.length} tasks done · {progressPercent}%
                        </p>
                        <div className="bar" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.15)' }}>
                            <i style={{ width: `${progressPercent}%`, background: '#ffffff' }}></i>
                        </div>
                        <button
                            onClick={() => openModal()}
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                background: '#ffffff',
                                color: '#17171c',
                                borderRadius: '10px',
                                padding: '10px 0',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            + New Task
                        </button>
                    </div>

                    <nav className="nav" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f4', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <a href="#">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <circle cx="8" cy="8" r="2.2"/>
                                <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>
                            </svg>
                            Settings
                        </a>
                        <a href="#">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <circle cx="8" cy="8" r="6"/>
                                <path d="M6.2 6.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1M8 11.5v.1"/>
                            </svg>
                            Help &amp; Support
                        </a>
                        <Link href="/">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H6"/>
                            </svg>
                            Log out
                        </Link>
                    </nav>
                </aside>

                <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', overflowY: 'auto' }}>
                    <header style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600, whiteSpace: 'nowrap', color: '#17171c' }}>
                            {activeNav === 'my-tasks' ? 'My Tasks' : activeNav === 'blocked' ? 'Blocked Tasks' : 'Workspace'}
                        </h1>

                        <div className="box" style={{ flex: 1, minWidth: '200px', maxWidth: '440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                            <svg width="16" height="16" fill="none" stroke="#888" strokeWidth="2">
                                <circle cx="7" cy="7" r="5"/>
                                <path d="m11 11 3 3"/>
                            </svg>
                            <input
                                id="q"
                                className="outline-none text-sm"
                                style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }}
                                placeholder="Search tasks…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            <span style={{ fontSize: '11px', fontWeight: 600, border: '1px solid #e5e5ec', borderRadius: '6px', padding: '2px 6px', color: '#6b7280' }}>
                                /
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B0623E', display: 'inline-block' }}></span>
                            Live
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => {
                                    setNotificationsOpen(!notificationsOpen);
                                    setProfileOpen(false);
                                }}
                                style={{ position: 'relative', width: '36px', height: '36px', display: 'grid', placeItems: 'center', background: notificationsOpen ? '#f0f0f4' : 'none', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                                aria-label="Notifications"
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
                                    <path d="M4.5 12.5V8a4.5 4.5 0 0 1 9 0v4.5l1 1.5h-11zM7.5 16h3"/>
                                </svg>
                                <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#B0623E', border: '2px solid #fff' }}></span>
                            </button>

                            {notificationsOpen && (
                                <div
                                    className="box pop"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '44px',
                                        width: '320px',
                                        padding: '16px',
                                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
                                        zIndex: 100,
                                        background: '#ffffff'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#17171c' }}>Notifications</span>
                                        <span style={{ fontSize: '11px', background: '#f7efe9', color: '#B0623E', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                                            {blockedCount > 0 ? `${blockedCount} alerts` : 'All clear'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                                        {tasks.filter(isBlocked).map(t => (
                                            <div key={t.id} style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px' }}>
                                                <div style={{ fontWeight: 600, color: '#991b1b' }}>Blocked Task Alert</div>
                                                <div style={{ color: '#7f1d1d', marginTop: '2px' }}>{t.title} is waiting on unfinished dependencies.</div>
                                            </div>
                                        ))}
                                        <div style={{ padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px' }}>
                                            <div style={{ fontWeight: 600, color: '#166534' }}>Real-time Collaboration</div>
                                            <div style={{ color: '#14532d', marginTop: '2px' }}>Connected to Express backend server with auto-sync.</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => {
                                    setProfileOpen(!profileOpen);
                                    setNotificationsOpen(false);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                            >
                                <span className="av" style={{ width: '36px', height: '36px', fontSize: '12px', background: loggedInUser.c, color: '#ffffff' }}>
                                    {getInitials(loggedInUser.name)}
                                </span>
                            </button>

                            {profileOpen && (
                                <div
                                    className="box pop"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '44px',
                                        width: '260px',
                                        padding: '16px',
                                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
                                        zIndex: 100,
                                        background: '#ffffff'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #ececf2' }}>
                                        <span className="av" style={{ width: '40px', height: '40px', fontSize: '13px', background: loggedInUser.c, color: '#ffffff' }}>
                                            {getInitials(loggedInUser.name)}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#17171c' }}>{loggedInUser.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{loggedInUser.email}</div>
                                            <span className="tag" style={{ fontSize: '10px', background: '#f7efe9', color: '#B0623E', marginTop: '4px', padding: '1px 6px' }}>{loggedInUser.role}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => {
                                                handleNavClick('my-tasks');
                                                setProfileOpen(false);
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', color: '#17171c', textDecoration: 'none', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            My Assigned Tasks
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleNavClick('blocked');
                                                setProfileOpen(false);
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', color: '#17171c', textDecoration: 'none', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            Blocked Tasks
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                router.push('/login');
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', color: '#dc2626', textDecoration: 'none', border: 'none', background: 'none', borderTop: '1px solid #ececf2', marginTop: '6px', paddingTop: '8px', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <section className="box" style={{ padding: '20px', marginTop: '24px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c' }}>Recommended Categories</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            {CATS.map(([n, c, p]) => (
                                <button
                                    key={n}
                                    className="cat"
                                    onClick={() => handleCategoryClick(n)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={p}/>
                                    </svg>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', borderRadius: '12px', background: '#f4f4f3', border: '1px solid #ebebf0' }}>
                            {[
                                ['all', 'All', ''],
                                ['high', 'High', '#B0623E'],
                                ['medium', 'Medium', '#17171c'],
                                ['low', 'Low', '#b5b5b5']
                            ].map(([v, l, c]) => {
                                const isSel = fP === v;
                                const count = v !== 'all' ? tasks.filter(k => k.pri === v).length : 0;
                                return (
                                    <button
                                        key={v}
                                        onClick={() => setFP(fP === v ? 'all' : v)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: isSel ? '#ffffff' : 'transparent',
                                            boxShadow: isSel ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                            color: isSel ? '#17171c' : '#6b7280'
                                        }}
                                    >
                                        {c && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }}></span>}
                                        {l}
                                        {v !== 'all' && (
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{count}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <select
                            id="fu"
                            className="tool"
                            value={fU}
                            onChange={(e) => setFU(e.target.value)}
                        >
                            <option value="all">Assignee: All</option>
                            {users.map(x => (
                                <option key={x.id} value={x.id}>{x.n}</option>
                            ))}
                        </select>

                        <select
                            id="sort"
                            className="tool"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="pri">Sort: Priority</option>
                            <option value="title">Sort: Title</option>
                            <option value="prog">Sort: Progress</option>
                        </select>

                        <button
                            id="hd"
                            className={`tool ${hideDone ? 'on' : ''}`}
                            onClick={() => setHideDone(!hideDone)}
                        >
                            Hide done
                        </button>

                        <button
                            onClick={() => openModal()}
                            className="btn"
                            style={{ marginLeft: 'auto' }}
                        >
                            + New Task
                        </button>
                    </section>

                    <section style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                        {fP !== 'all' && (
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Showing <b style={{ color: '#17171c' }}>{PRI[fP][0]}</b> priority tasks only &middot;{' '}
                                <button style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#17171c' }} onClick={() => setFP('all')}>
                                    Clear
                                </button>
                            </div>
                        )}

                        {fS === 'blocked' && (
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Showing blocked tasks &middot;{' '}
                                <button style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#17171c' }} onClick={() => setFS('all')}>
                                    Clear
                                </button>
                            </div>
                        )}

                        {Object.entries(ST)
                            .filter(([s]) => !(hideDone && s === 'done'))
                            .map(([statusKey, [statusLabel]]) => {
                                const columnTasks = filteredTasks.filter(x => x.status === statusKey);
                                const isDragOver = dragOverCol === statusKey;

                                return (
                                    <div
                                        key={statusKey}
                                        className={`grp ${isDragOver ? 'drag' : ''}`}
                                        style={{ padding: '4px' }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragOverCol(statusKey);
                                        }}
                                        onDragLeave={() => setDragOverCol(null)}
                                        onDrop={(e) => {
                                            setDragOverCol(null);
                                            const taskId = e.dataTransfer.getData('id');
                                            if (taskId) handleMove(taskId, statusKey);
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px', padding: '0 4px' }}>
                                            <span>{statusLabel} · {columnTasks.length}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {columnTasks.map(k => {
                                                const [pl, pb, pc, pbc] = PRI[k.pri] || PRI.medium;
                                                const [sl, sb, sc, sbc] = ST[k.status] || ST.todo;
                                                const b = isBlocked(k);
                                                const ndone = (k.deps || []).filter(d => {
                                                    const dep = getTask(d);
                                                    return dep && dep.status === 'done';
                                                }).length;

                                                const blockingList = (k.deps || [])
                                                    .map(d => getTask(d))
                                                    .filter(d => d && d.status !== 'done');

                                                return (
                                                    <div
                                                        key={k.id}
                                                        className="row pop"
                                                        draggable="true"
                                                        onDragStart={(e) => e.dataTransfer.setData('id', k.id)}
                                                        onClick={() => openModal(k.id)}
                                                        style={{
                                                            padding: '14px 16px',
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            cursor: 'pointer',
                                                            flexWrap: 'wrap'
                                                        }}
                                                    >
                                                        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '15px', textDecoration: k.status === 'done' ? 'line-through' : 'none', color: k.status === 'done' ? '#9ca3af' : '#17171c' }}>
                                                                {k.title}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                                                {k.cat || 'General'}
                                                                {b && (
                                                                    <span style={{ color: '#B0623E', fontWeight: 600 }}>
                                                                        {' '}· Blocked by {blockingList.map(d => d.title).join(', ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <span className="cnt" title="Dependencies done">
                                                                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M6 10 10 6M7 4l1-1a3 3 0 0 1 4 4l-1 1M9 12l-1 1a3 3 0 0 1-4-4l1-1"/>
                                                                </svg>
                                                                {ndone}/{(k.deps || []).length}
                                                            </span>

                                                            <div style={{ display: 'flex', marginLeft: '-4px', width: '56px' }}>
                                                                {(k.users || []).map(userId => {
                                                                    const userObj = getUser(userId);
                                                                    return (
                                                                        <span key={userId} className="av" title={userObj.n} style={{ background: userObj.c, marginLeft: '-6px' }}>
                                                                            {getInitials(userObj.n)}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>

                                                            <select
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => handleMove(k.id, e.target.value)}
                                                                className="tag outline-none"
                                                                value={k.status}
                                                                style={{ background: sb, color: sc, border: sbc === 'none' ? 'none' : `1.5px solid ${sbc || '#17171c'}`, cursor: 'pointer' }}
                                                            >
                                                                {Object.entries(ST).map(([s, [label]]) => (
                                                                    <option key={s} value={s}>{label}</option>
                                                                ))}
                                                            </select>

                                                            <span className="tag" style={{ background: pb, color: pc, border: `1.5px solid ${pbc || '#17171c'}` }}>
                                                                {pl}
                                                            </span>

                                                            <span style={{ fontSize: '12px', color: '#6b7280', width: '90px' }}>
                                                                {k.status === 'done' ? 'Completed' : `${k.due} days left`}
                                                            </span>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                                                                <div className="bar" style={{ flex: 1 }}>
                                                                    <i style={{ width: `${k.prog}%` }}></i>
                                                                </div>
                                                                <span style={{ fontSize: '12px', color: '#6b7280', width: '32px', textAlign: 'right' }}>
                                                                    {k.prog}%
                                                                </span>
                                                            </div>

                                                            <span style={{ color: '#9ca3af', padding: '0 4px', fontSize: '18px', lineHeight: 1 }}>
                                                                &middot;&middot;&middot;
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <button
                                                onClick={() => openModal(null, statusKey)}
                                                style={{
                                                    width: '100%',
                                                    border: '1px dashed #d1d5db',
                                                    borderRadius: '12px',
                                                    padding: '12px 0',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#4b5563',
                                                    background: 'transparent',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Add task
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </section>
                </main>

            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        zIndex: 50
                    }}
                    onClick={closeModal}
                >
                    <form
                        className="frame pop"
                        style={{ width: '100%', maxWidth: '512px', padding: '24px' }}
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={handleFormSubmit}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#17171c' }}>
                                {editingTask ? 'Edit task' : 'New task'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                style={{ color: '#9ca3af', fontSize: '24px', lineHeight: 1, border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                id="f-title"
                                className="field"
                                placeholder="Task title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                required
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    id="f-cat"
                                    className="field"
                                    placeholder="Category (e.g. Design)"
                                    value={formCat}
                                    onChange={(e) => setFormCat(e.target.value)}
                                />
                                <input
                                    id="f-due"
                                    type="number"
                                    min="0"
                                    className="field"
                                    placeholder="Days left"
                                    value={formDue}
                                    onChange={(e) => setFormDue(e.target.value)}
                                />
                            </div>

                            <textarea
                                id="f-desc"
                                className="field"
                                rows="2"
                                placeholder="Description"
                                value={formDesc}
                                onChange={(e) => setFormDesc(e.target.value)}
                                style={{ resize: 'vertical' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                    Priority
                                    <select
                                        id="f-pri"
                                        className="field"
                                        style={{ marginTop: '4px' }}
                                        value={formPri}
                                        onChange={(e) => setFormPri(e.target.value)}
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </label>

                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                    Status
                                    <select
                                        id="f-status"
                                        className="field"
                                        style={{ marginTop: '4px' }}
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value)}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </label>
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                Assign users
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {users.map(x => {
                                        const isChecked = formUsers.includes(x.id);
                                        return (
                                            <label key={x.id} className="chip">
                                                <input
                                                    type="checkbox"
                                                    value={x.id}
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setFormUsers(formUsers.filter(u => u !== x.id));
                                                        } else {
                                                            setFormUsers([...formUsers, x.id]);
                                                        }
                                                    }}
                                                    className="accent-black"
                                                />
                                                {x.n}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                Depends on
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                                    {availableDependencyOptions.length === 0 ? (
                                        <span style={{ color: '#9ca3af', fontWeight: 400 }}>No other tasks yet</span>
                                    ) : (
                                        availableDependencyOptions.map(x => {
                                            const isChecked = formDeps.includes(x.id);
                                            return (
                                                <label key={x.id} className="chip">
                                                    <input
                                                        type="checkbox"
                                                        value={x.id}
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            if (isChecked) {
                                                                setFormDeps(formDeps.filter(d => d !== x.id));
                                                            } else {
                                                                setFormDeps([...formDeps, x.id]);
                                                            }
                                                        }}
                                                        className="accent-black"
                                                    />
                                                    {x.title}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {formErr && (
                                <p style={{ fontSize: '14px', color: '#B0623E', fontWeight: 500 }}>
                                    {formErr}
                                </p>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center' }}>
                            {editingTask && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    style={{ fontSize: '14px', color: '#B0623E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                <button
                                    type="button"
                                    className="chip"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn">
                                    Save task
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function DashboardPageWrapper() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
