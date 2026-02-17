<<<<<<< HEAD
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Eye,
    EyeOff,
    RefreshCw,
    Shield,
    Search,
    Mail,
    KeyRound,
    Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAccessPages, AccessPage } from '@/hooks/useAccessPages';

interface PermissionState {
    [pageId: string]: boolean;
}

interface SecurityAccessTabProps {
    /** For editing — the client's current permissions (from useClientPermissions) */
    existingPermissions?: { page_id: string; granted: boolean }[];
    /** Callback to update the parent form's permissions state */
    onPermissionsChange: (permissions: PermissionState) => void;
    /** Password value */
    password: string;
    /** Callback to update the parent form's password state */
    onPasswordChange: (password: string) => void;
    /** Whether to force password change on first login */
    forcePasswordChange: boolean;
    /** Callback for force password change toggle */
    onForcePasswordChangeToggle: (value: boolean) => void;
    /** Last login date (for display in edit mode) */
    lastLogin?: string | null;
    /** Whether this is edit mode (vs new client) */
    isEditMode?: boolean;
    /** Callback when reset password button is clicked */
    onResetPassword?: () => void;
}

// Password strength calculator
function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
    bgClass: string;
} {
    if (!password) return { score: 0, label: '', color: '', bgClass: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Fraca', color: '#ef4444', bgClass: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Média', color: '#f59e0b', bgClass: 'bg-amber-500' };
    if (score <= 3) return { score, label: 'Forte', color: '#22c55e', bgClass: 'bg-green-500' };
    return { score, label: 'Muito Forte', color: '#c8e632', bgClass: 'bg-[#c8e632]' };
}

// Strong password generator
function generateStrongPassword(length = 16): string {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*_+-=';
    const all = lower + upper + digits + symbols;

    // Ensure at least one of each
    let password = '';
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

export function SecurityAccessTab({
    existingPermissions,
    onPermissionsChange,
    password,
    onPasswordChange,
    forcePasswordChange,
    onForcePasswordChangeToggle,
    lastLogin,
    isEditMode = false,
    onResetPassword,
}: SecurityAccessTabProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [permSearch, setPermSearch] = useState('');
    const [permissions, setPermissions] = useState<PermissionState>({});

    const { data: accessPages, isLoading: pagesLoading } = useAccessPages('active');

    // Initialize permissions from existing data
    useEffect(() => {
        if (accessPages && accessPages.length > 0) {
            const initial: PermissionState = {};
            accessPages.forEach((page) => {
                const existing = existingPermissions?.find((p) => p.page_id === page.id);
                initial[page.id] = existing ? existing.granted : !isEditMode; // New clients get all permissions by default
            });
            setPermissions(initial);
            onPermissionsChange(initial);
        }
    }, [accessPages, existingPermissions, isEditMode]);

    const handleTogglePermission = useCallback(
        (pageId: string, checked: boolean) => {
            setPermissions((prev) => {
                const next = { ...prev, [pageId]: checked };
                onPermissionsChange(next);
                return next;
            });
        },
        [onPermissionsChange]
    );

    const handleGeneratePassword = useCallback(() => {
        const pw = generateStrongPassword();
        onPasswordChange(pw);
    }, [onPasswordChange]);

    const strength = useMemo(() => getPasswordStrength(password), [password]);

    const filteredPages = useMemo(() => {
        if (!accessPages) return [];
        if (!permSearch) return accessPages;
        const q = permSearch.toLowerCase();
        return accessPages.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        );
    }, [accessPages, permSearch]);

    const grantedCount = useMemo(
        () => Object.values(permissions).filter(Boolean).length,
        [permissions]
    );

    const totalCount = accessPages?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ─── Seção A: Credenciais de Acesso ─── */}
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                        Credenciais de Acesso
                    </h3>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <Label htmlFor="client-password">Senha</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="client-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                placeholder="Digite a senha do cliente"
                                className="pr-10 rounded-xl bg-background border-border/50 h-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGeneratePassword}
                            className="rounded-xl gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Gerar Senha
                        </Button>
                    </div>
                </div>

                {/* Password strength bar */}
                {password && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Força da senha</span>
                            <span style={{ color: strength.color }} className="font-medium">
                                {strength.label}
                            </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${strength.bgClass}`}
                                style={{ width: `${(strength.score / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Force password change toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30">
                    <div className="space-y-0.5">
                        <Label
                            htmlFor="force-password-change"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Forçar troca de senha no primeiro login
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            O cliente será obrigado a criar uma nova senha ao fazer login pela
                            primeira vez
                        </p>
                    </div>
                    <Switch
                        id="force-password-change"
                        checked={forcePasswordChange}
                        onCheckedChange={onForcePasswordChangeToggle}
                    />
                </div>

                {/* Edit mode extras */}
                {isEditMode && (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onResetPassword}
                            className="rounded-xl gap-2 text-sm"
                        >
                            <Mail className="h-4 w-4" />
                            Resetar Senha por E-mail
                        </Button>

                        {lastLogin && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Último login:{' '}
                                {new Date(lastLogin).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Separator className="bg-border/30" />

            {/* ─── Seção B: Permissões de Acesso ─── */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                            Permissões de Acesso
                        </h3>
                    </div>
                    <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs font-medium"
                    >
                        {grantedCount} de {totalCount} ativas
                    </Badge>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar páginas..."
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                        className="pl-10 rounded-xl bg-background border-border/50 h-10"
                    />
                </div>

                {/* Pages list */}
                <div className="space-y-2">
                    {pagesLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Carregando páginas...
                        </div>
                    ) : filteredPages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhuma página encontrada.
                        </div>
                    ) : (
                        filteredPages.map((page) => (
                            <PagePermissionRow
                                key={page.id}
                                page={page}
                                granted={permissions[page.id] ?? false}
                                onToggle={(checked) => handleTogglePermission(page.id, checked)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component: single permission row
function PagePermissionRow({
    page,
    granted,
    onToggle,
}: {
    page: AccessPage;
    granted: boolean;
    onToggle: (checked: boolean) => void;
}) {
    return (
        <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${granted
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/20 border-border/30'
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${granted
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                >
                    <Shield className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{page.name}</p>
                    {page.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {page.description}
                        </p>
                    )}
                </div>
            </div>
            <Switch
                checked={granted}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-[#c8e632]"
            />
        </div>
    );
}
=======
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Eye,
    EyeOff,
    RefreshCw,
    Shield,
    Search,
    Mail,
    KeyRound,
    Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAccessPages, AccessPage } from '@/hooks/useAccessPages';

interface PermissionState {
    [pageId: string]: boolean;
}

interface SecurityAccessTabProps {
    /** For editing — the client's current permissions (from useClientPermissions) */
    existingPermissions?: { page_id: string; granted: boolean }[];
    /** Callback to update the parent form's permissions state */
    onPermissionsChange: (permissions: PermissionState) => void;
    /** Password value */
    password: string;
    /** Callback to update the parent form's password state */
    onPasswordChange: (password: string) => void;
    /** Whether to force password change on first login */
    forcePasswordChange: boolean;
    /** Callback for force password change toggle */
    onForcePasswordChangeToggle: (value: boolean) => void;
    /** Last login date (for display in edit mode) */
    lastLogin?: string | null;
    /** Whether this is edit mode (vs new client) */
    isEditMode?: boolean;
    /** Callback when reset password button is clicked */
    onResetPassword?: () => void;
}

// Password strength calculator
function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
    bgClass: string;
} {
    if (!password) return { score: 0, label: '', color: '', bgClass: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Fraca', color: '#ef4444', bgClass: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Média', color: '#f59e0b', bgClass: 'bg-amber-500' };
    if (score <= 3) return { score, label: 'Forte', color: '#22c55e', bgClass: 'bg-green-500' };
    return { score, label: 'Muito Forte', color: '#c8e632', bgClass: 'bg-[#c8e632]' };
}

// Strong password generator
function generateStrongPassword(length = 16): string {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*_+-=';
    const all = lower + upper + digits + symbols;

    // Ensure at least one of each
    let password = '';
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

export function SecurityAccessTab({
    existingPermissions,
    onPermissionsChange,
    password,
    onPasswordChange,
    forcePasswordChange,
    onForcePasswordChangeToggle,
    lastLogin,
    isEditMode = false,
    onResetPassword,
}: SecurityAccessTabProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [permSearch, setPermSearch] = useState('');
    const [permissions, setPermissions] = useState<PermissionState>({});

    const { data: accessPages, isLoading: pagesLoading } = useAccessPages('active');

    // Initialize permissions from existing data
    useEffect(() => {
        if (accessPages && accessPages.length > 0) {
            const initial: PermissionState = {};
            accessPages.forEach((page) => {
                const existing = existingPermissions?.find((p) => p.page_id === page.id);
                initial[page.id] = existing ? existing.granted : !isEditMode; // New clients get all permissions by default
            });
            setPermissions(initial);
            onPermissionsChange(initial);
        }
    }, [accessPages, existingPermissions, isEditMode]);

    const handleTogglePermission = useCallback(
        (pageId: string, checked: boolean) => {
            setPermissions((prev) => {
                const next = { ...prev, [pageId]: checked };
                onPermissionsChange(next);
                return next;
            });
        },
        [onPermissionsChange]
    );

    const handleGeneratePassword = useCallback(() => {
        const pw = generateStrongPassword();
        onPasswordChange(pw);
    }, [onPasswordChange]);

    const strength = useMemo(() => getPasswordStrength(password), [password]);

    const filteredPages = useMemo(() => {
        if (!accessPages) return [];
        if (!permSearch) return accessPages;
        const q = permSearch.toLowerCase();
        return accessPages.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        );
    }, [accessPages, permSearch]);

    const grantedCount = useMemo(
        () => Object.values(permissions).filter(Boolean).length,
        [permissions]
    );

    const totalCount = accessPages?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ─── Seção A: Credenciais de Acesso ─── */}
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                        Credenciais de Acesso
                    </h3>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <Label htmlFor="client-password">Senha</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="client-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                placeholder="Digite a senha do cliente"
                                className="pr-10 rounded-xl bg-background border-border/50 h-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGeneratePassword}
                            className="rounded-xl gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Gerar Senha
                        </Button>
                    </div>
                </div>

                {/* Password strength bar */}
                {password && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Força da senha</span>
                            <span style={{ color: strength.color }} className="font-medium">
                                {strength.label}
                            </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${strength.bgClass}`}
                                style={{ width: `${(strength.score / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Force password change toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30">
                    <div className="space-y-0.5">
                        <Label
                            htmlFor="force-password-change"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Forçar troca de senha no primeiro login
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            O cliente será obrigado a criar uma nova senha ao fazer login pela
                            primeira vez
                        </p>
                    </div>
                    <Switch
                        id="force-password-change"
                        checked={forcePasswordChange}
                        onCheckedChange={onForcePasswordChangeToggle}
                    />
                </div>

                {/* Edit mode extras */}
                {isEditMode && (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onResetPassword}
                            className="rounded-xl gap-2 text-sm"
                        >
                            <Mail className="h-4 w-4" />
                            Resetar Senha por E-mail
                        </Button>

                        {lastLogin && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Último login:{' '}
                                {new Date(lastLogin).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Separator className="bg-border/30" />

            {/* ─── Seção B: Permissões de Acesso ─── */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                            Permissões de Acesso
                        </h3>
                    </div>
                    <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs font-medium"
                    >
                        {grantedCount} de {totalCount} ativas
                    </Badge>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar páginas..."
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                        className="pl-10 rounded-xl bg-background border-border/50 h-10"
                    />
                </div>

                {/* Pages list */}
                <div className="space-y-2">
                    {pagesLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Carregando páginas...
                        </div>
                    ) : filteredPages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhuma página encontrada.
                        </div>
                    ) : (
                        filteredPages.map((page) => (
                            <PagePermissionRow
                                key={page.id}
                                page={page}
                                granted={permissions[page.id] ?? false}
                                onToggle={(checked) => handleTogglePermission(page.id, checked)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component: single permission row
function PagePermissionRow({
    page,
    granted,
    onToggle,
}: {
    page: AccessPage;
    granted: boolean;
    onToggle: (checked: boolean) => void;
}) {
    return (
        <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${granted
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/20 border-border/30'
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${granted
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                >
                    <Shield className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{page.name}</p>
                    {page.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {page.description}
                        </p>
                    )}
                </div>
            </div>
            <Switch
                checked={granted}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-[#c8e632]"
            />
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
