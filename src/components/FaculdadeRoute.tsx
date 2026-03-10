import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FaculdadeRouteProps {
    children: React.ReactNode;
}

export function FaculdadeRoute({ children }: FaculdadeRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/client/login" replace />;
    }

    return <>{children}</>;
}
