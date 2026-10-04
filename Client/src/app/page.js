'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function HomePage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="wash" style={{ flex: 1 }}>
                <section style={{ maxWidth: '1150px', margin: '0 auto', padding: '64px 24px 80px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280' }}>
                        Task management for teams
                    </p>
                    <h1 className="serif" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 500, lineHeight: 1.08, marginTop: '20px', maxWidth: '850px', margin: '20px auto 0' }}>
                        Organize work. <span style={{ color: '#B0623E' }}>Ship together.</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: '#4b5563', marginTop: '24px', maxWidth: '600px', margin: '24px auto 0', lineHeight: 1.6 }}>
                        Create, assign and track tasks with clear priorities, statuses and dependencies, so everyone knows what to do next.
                    </p>
                    <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <Link href="/dashboard" className="btn btn-accent" style={{ padding: '12px 28px', fontSize: '15px' }}>
                            Open Task Dashboard
                        </Link>
                        <Link href="/signup" className="ghost" style={{ padding: '12px 28px', fontSize: '15px' }}>
                            Create Team Account
                        </Link>
                    </div>

                    <div className="box" style={{ marginTop: '64px', maxWidth: '850px', margin: '64px auto 0', padding: '20px', textAlign: 'left', boxShadow: '0 40px 80px -50px rgba(80,50,30,.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>
                            <span>In progress</span>
                            <span>3 tasks</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#17171c' }}>Design task board UI</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Design</div>
                                </div>
                                <span className="tag tag-dark">In Progress</span>
                                <span className="tag tag-priority-high">High</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                                    <div className="bar" style={{ flex: 1 }}>
                                        <i style={{ width: '64%' }}></i>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>64%</span>
                                </div>
                            </div>

                            <div className="box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#17171c' }}>Build REST API</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Development</div>
                                </div>
                                <span className="tag tag-dark">In Progress</span>
                                <span className="tag tag-priority-medium">Medium</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                                    <div className="bar" style={{ flex: 1 }}>
                                        <i style={{ width: '38%' }}></i>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>38%</span>
                                </div>
                            </div>

                            <div className="box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#17171c' }}>Integrate frontend with API</div>
                                    <div style={{ fontSize: '12px', color: '#B0623E' }}>Waiting on 2 tasks (Blocked)</div>
                                </div>
                                <span className="tag tag-blocked">Blocked</span>
                                <span className="tag tag-priority-low">Low</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                                    <div className="bar" style={{ flex: 1 }}>
                                        <i style={{ width: '0%' }}></i>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section id="features" style={{ maxWidth: '1150px', margin: '0 auto', padding: '96px 24px' }}>
                <h2 className="serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, maxWidth: '600px', lineHeight: 1.15 }}>
                    Everything a team needs, nothing it doesn’t.
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '48px' }}>
                    <div className="box" style={{ padding: '28px' }}>
                        <div className="ic">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#B0623E" strokeWidth="1.6">
                                <path d="M8 3v10M3 8h10"/>
                            </svg>
                        </div>
                        <h3 style={{ fontWeight: 600, fontSize: '18px', marginTop: '20px', color: '#17171c' }}>Create and edit</h3>
                        <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                            Add tasks with a title, description, priority and status in seconds. Edit anything at any time.
                        </p>
                    </div>
                    <div className="box" style={{ padding: '28px' }}>
                        <div className="ic">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#B0623E" strokeWidth="1.6">
                                <circle cx="6" cy="5" r="2.5"/>
                                <path d="M1.5 14a4.5 4.5 0 0 1 9 0M11 3a2.5 2.5 0 0 1 0 5M12.5 10a4 4 0 0 1 2 4"/>
                            </svg>
                        </div>
                        <h3 style={{ fontWeight: 600, fontSize: '18px', marginTop: '20px', color: '#17171c' }}>Assign to people</h3>
                        <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                            Give each task one or more owners and see every teammate’s open workload at a glance.
                        </p>
                    </div>
                    <div className="box" style={{ padding: '28px' }}>
                        <div className="ic">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#B0623E" strokeWidth="1.6">
                                <circle cx="3.5" cy="4" r="2"/>
                                <circle cx="12.5" cy="12" r="2"/>
                                <path d="M5.5 4h3a2 2 0 0 1 2 2v4"/>
                            </svg>
                        </div>
                        <h3 style={{ fontWeight: 600, fontSize: '18px', marginTop: '20px', color: '#17171c' }}>Task dependencies</h3>
                        <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                            Link tasks that depend on each other. Blocked work is flagged until what it relies on is done.
                        </p>
                    </div>
                </div>
            </section>

            <section id="how" style={{ borderTop: '1px solid #ececf2', borderBottom: '1px solid #ececf2', background: '#ffffff' }}>
                <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '96px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
                    <div>
                        <div className="serif" style={{ fontSize: '48px', color: '#B0623E', fontWeight: 600 }}>01</div>
                        <h3 style={{ fontWeight: 600, marginTop: '16px', fontSize: '18px' }}>Plan</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', lineHeight: 1.6 }}>
                            Break projects into tasks and set priority: high, medium or low.
                        </p>
                    </div>
                    <div>
                        <div className="serif" style={{ fontSize: '48px', color: '#B0623E', fontWeight: 600 }}>02</div>
                        <h3 style={{ fontWeight: 600, marginTop: '16px', fontSize: '18px' }}>Assign</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', lineHeight: 1.6 }}>
                            Share the work across your team and connect related tasks.
                        </p>
                    </div>
                    <div>
                        <div className="serif" style={{ fontSize: '48px', color: '#B0623E', fontWeight: 600 }}>03</div>
                        <h3 style={{ fontWeight: 600, marginTop: '16px', fontSize: '18px' }}>Track</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', lineHeight: 1.6 }}>
                            Move tasks from To Do to In Progress to Done and watch progress update live.
                        </p>
                    </div>
                </div>
            </section>

            <section id="teams" style={{ maxWidth: '1150px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
                <h2 className="serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500 }}>
                    Bring your team into focus.
                </h2>
                <p style={{ color: '#4b5563', marginTop: '16px', fontSize: '16px' }}>
                    Free for small teams. No credit card required.
                </p>
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Link href="/dashboard" className="btn btn-accent" style={{ padding: '12px 28px', fontSize: '15px' }}>
                        Start managing tasks
                    </Link>
                </div>
            </section>

            <footer style={{ maxWidth: '1150px', margin: '0 auto', padding: '32px 24px', borderTop: '1px solid #ececf2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: '#6b7280', width: '100%' }}>
                <span className="serif" style={{ fontSize: '18px', color: '#17171c', fontWeight: 600 }}>Taskly.</span>
                <span>© 2026 Taskly. All rights reserved.</span>
            </footer>
        </div>
    );
}
