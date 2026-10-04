'use client';

export default function TaskCard({
    task,
    allTasks = [],
    users = [],
    onStatusChange,
    onAssignChange,
    onEdit,
    onDelete,
    onAddDependency,
    onRemoveDependency
}) {
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High':
                return 'tag-priority-high';
            case 'Medium':
                return 'tag-priority-medium';
            case 'Low':
                return 'tag-priority-low';
            default:
                return 'tag-default';
        }
    };

    const getStatusTagClass = (status) => {
        switch (status) {
            case 'Done':
                return 'tag-done';
            case 'In Progress':
                return 'tag-dark';
            default:
                return 'tag-default';
        }
    };

    const assignedUser = task.assignedUser || users.find(u => u.id === task.assignedTo);

    return (
        <div
            className="box"
            style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: task.isBlocked ? '#fecaca' : '#ececf2',
                backgroundColor: task.isBlocked ? '#fffcfc' : '#ffffff',
                transition: 'all 0.15s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span className={`tag ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className={`tag ${getStatusTagClass(task.status)}`}>
                            {task.status}
                        </span>
                        {task.isBlocked && (
                            <span className="tag tag-blocked">
                                ⚠ Blocked
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#17171c', marginTop: '2px' }}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>
                            {task.description}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                        onClick={() => onEdit(task)}
                        className="ghost"
                        style={{ padding: '4px 8px', fontSize: '12px', height: '28px' }}
                        title="Edit Task"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="ghost"
                        style={{ padding: '4px 8px', fontSize: '12px', height: '28px', color: '#dc2626' }}
                        title="Delete Task"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {task.isBlocked && task.blockingDependencies && task.blockingDependencies.length > 0 && (
                <div
                    style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#991b1b'
                    }}
                >
                    <strong style={{ display: 'block', marginBottom: '2px' }}>Blocked by unresolved dependencies:</strong>
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                        {task.blockingDependencies.map(dep => (
                            <li key={dep.id}>
                                {dep.title} ({dep.status})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {task.dependencyDetails && task.dependencyDetails.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <span style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Dependencies ({task.dependencyDetails.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {task.dependencyDetails.map(dep => (
                            <span
                                key={dep.id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: dep.isCompleted ? '#f0fdf4' : '#f3f4f6',
                                    border: `1px solid ${dep.isCompleted ? '#bbf7d0' : '#e5e7eb'}`,
                                    fontSize: '11px',
                                    color: dep.isCompleted ? '#16a34a' : '#4b5563'
                                }}
                            >
                                <span>{dep.isCompleted ? '✓' : '○'} {dep.title}</span>
                                {onRemoveDependency && (
                                    <button
                                        onClick={() => onRemoveDependency(task.id, dep.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '12px' }}
                                        title="Remove dependency"
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f1f4',
                    marginTop: '2px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Assignee:</span>
                    <select
                        value={task.assignedTo || ''}
                        onChange={(e) => onAssignChange(task.id, e.target.value || null)}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e3e3ea',
                            background: '#fff',
                            color: '#17171c'
                        }}
                    >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Status:</span>
                    <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #e3e3ea',
                            background: task.status === 'Done' ? '#f0fdf4' : task.status === 'In Progress' ? '#17171c' : '#fff',
                            color: task.status === 'In Progress' ? '#fff' : task.status === 'Done' ? '#16a34a' : '#17171c',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
