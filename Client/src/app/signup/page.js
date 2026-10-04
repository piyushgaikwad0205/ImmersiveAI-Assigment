'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await register(name.trim(), email.trim(), 'developer');
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <header style={{ maxWidth: '1150px', width: '100%', margin: '0 auto', padding: '24px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#17171c' }}>
                    <span className="serif" style={{ fontSize: '24px', fontWeight: 600 }}>Taskly.</span>
                </Link>
            </header>

            <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '0 24px 64px' }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        width: '100%',
                        maxWidth: '380px',
                        background: '#ffffff',
                        border: '1px solid #ececf2',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 30px 60px -40px rgba(0,0,0,0.18)'
                    }}
                >
                    <h1 className="serif" style={{ fontSize: '30px', fontWeight: 500, color: '#17171c' }}>
                        Sign up
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        Start organizing your team’s work in minutes.
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                        <input
                            className="field"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            className="field"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            className="field"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '24px',
                            background: '#17171c',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '12px 0',
                            fontSize: '14px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>

                    <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '24px' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ fontWeight: 600, color: '#B0623E', textDecoration: 'underline' }}>
                            Log in
                        </Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
