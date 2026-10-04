import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
    title: 'Taskly · Plan, assign and track work together',
    description: 'Smart Task Manager with priorities, real-time tracking, dependencies, and team collaboration.'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
