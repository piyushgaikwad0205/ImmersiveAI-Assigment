'use client';

import { useState, useEffect } from 'react';

export default function TaskModal({
    isOpen,
    onClose,
    onSave,
    editingTask = null,
    allTasks = [],
    users = []
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('To Do');
    const [assignedTo, setAssignedTo] = useState('');
    const [dependencies, setDependencies] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title || '');
            setDescription(editingTask.description || '');
            setPriority(editingTask.priority || 'Medium');
            setStatus(editingTask.status || 'To Do');
            setAssignedTo(editingTask.assignedTo || '');
            setDependencies(editingTask.dependencies || []);
        } else {
            setTitle('');
            setDescription('');
            setPriority('Medium');
            setStatus('To Do');
            setAssignedTo('');
            setDependencies([]);
        }
        setError('');
    }, [editingTask, isOpen]);

    if (!isOpen) return null;

    const availableDependencyTasks = allTasks.filter(
        t => !editingTask || t.id !== editingTask.id
    );

    const toggleDependency = (id) => {
        if (dependencies.includes(id)) {
            setDependencies(dependencies.filter(d => d !== id));
        } else {
            setDependencies([...dependencies, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Please enter a task title');
            return;
        }

        try {
            setSubmitting(true);
            await onSave({
                title: title.trim(),
                description: description.trim(),
                priority,
                status,
                assignedTo: assignedTo || null,
                dependencies
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save task');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid #ececf2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="serif" style={{ fontSize: '20px', fontWeight: 600, color: '#17171c' }}>
                        {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                            Task Title *
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Implement authentication flow"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                            Description
                        </label>
                        <textarea
                            className="input-field"
                            rows="3"
                            placeholder="Describe what needs to be done..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                                Priority
                            </label>
                            <select
                                className="input-field"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                                Status
                            </label>
                            <select
                                className="input-field"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                            Assign To
                        </label>
                        <select
                            className="input-field"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#17171c' }}>
                            Dependencies (Tasks this task relies on)
                        </label>
                        <div
                            style={{
                                maxHeight: '140px',
                                overflowY: 'auto',
                                border: '1px solid #e3e3ea',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                background: '#fafafc'
                            }}
                        >
                            {availableDependencyTasks.length === 0 ? (
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>No other tasks available to depend on</span>
                            ) : (
                                availableDependencyTasks.map(t => (
                                    <label
                                        key={t.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            color: '#17171c'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={dependencies.includes(t.id)}
                                            onChange={() => toggleDependency(t.id)}
                                            style={{ accentColor: '#B0623E' }}
                                        />
                                        <span style={{ flex: 1 }}>{t.title}</span>
                                        <span className={`tag ${t.status === 'Done' ? 'tag-done' : 'tag-default'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                            {t.status}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #ececf2', paddingTop: '16px' }}>
                        <button type="button" onClick={onClose} className="ghost" style={{ padding: '8px 16px' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-accent" style={{ padding: '8px 20px' }}>
                            {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
