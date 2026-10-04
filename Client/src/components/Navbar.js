'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, users, switchUser, logout } = useAuth();
    const pathname = usePathname();

    return (
        <header className="border-b border-[#ececf2] bg-white sticky top-0 z-50">
            <div className="container-xl py-4 flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '14px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: '#17171c' }}>
                        <span className="serif" style={{ fontSize: '24px', fontWeight: 600 }}>Taskly.</span>
                    </Link>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Link
                            href="/dashboard"
                            style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: pathname === '/dashboard' ? '600' : '500',
                                color: pathname === '/dashboard' ? '#B0623E' : '#6b7280'
                            }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/#features"
                            style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#6b7280'
                            }}
                        >
                            Features
                        </Link>
                        <Link
                            href="/#how"
                            style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#6b7280'
                            }}
                        >
                            How it works
                        </Link>
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fbfbfe', border: '1px solid #ececf2', padding: '6px 12px', borderRadius: '10px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f7efe9', color: '#B0623E', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 700 }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#17171c', lineHeight: 1.2 }}>{user.name}</span>
                                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{user.role || 'Member'}</span>
                                </div>
                            </div>

                            <button onClick={logout} className="ghost" style={{ padding: '7px 14px', fontSize: '13px' }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href="/login" className="ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Log in
                            </Link>
                            <Link href="/signup" className="btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
