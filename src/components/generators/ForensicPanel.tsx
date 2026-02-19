import React, { useState } from 'react';
import type { ForensicLog } from '@/hooks/useGeminiImageGeneration';

// ============================================================
// Forensic Panel — Exibe 100% do que influencia a geração
// ============================================================

interface ForensicPanelProps {
    log: ForensicLog | null;
    isOpen: boolean;
    onClose: () => void;
}

function JsonBlock({ title, data, defaultOpen = false }: { title: string; data: any; defaultOpen?: boolean }) {
    const [expanded, setExpanded] = useState(defaultOpen);
    return (
        <div style={{ marginBottom: 12, border: '1px solid #333', borderRadius: 6 }}>
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: expanded ? '6px 6px 0 0' : 6,
                }}
            >
                <span>{title}</span>
                <span style={{ opacity: 0.5, fontSize: 11 }}>{expanded ? '▼' : '▶'}</span>
            </button>
            {expanded && (
                <pre
                    style={{
                        margin: 0,
                        padding: '10px 12px',
                        background: '#0d0d1a',
                        color: '#7fdbca',
                        fontSize: 11,
                        lineHeight: 1.5,
                        overflow: 'auto',
                        maxHeight: 400,
                        borderRadius: '0 0 6px 6px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}

function StatusBadge({ success }: { success: boolean }) {
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                background: success ? '#22c55e' : '#ef4444',
            }}
        >
            {success ? '✓ SUCESSO' : '✗ FALHA'}
        </span>
    );
}

export function ForensicPanel({ log, isOpen, onClose }: ForensicPanelProps) {
    if (!isOpen || !log) return null;

    const retryDiffs = log.steps.flatMap(step =>
        step.requests.length > 1
            ? step.requests.slice(1).map((req, i) => ({
                step: step.step,
                attempt: req.attempt,
                diff: {
                    keyIndex: `${step.requests[i].keyIndex} → ${req.keyIndex}`,
                    timeDelta: `+${req.timestamp - step.requests[i].timestamp}ms`,
                },
            }))
            : []
    );

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '55vw',
                maxWidth: 720,
                height: '100vh',
                background: '#111128',
                color: '#e0e0e0',
                zIndex: 9999,
                overflowY: 'auto',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            }}
        >
            {/* Header */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    background: '#111128',
                    padding: '16px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10,
                }}
            >
                <div>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>🔬 Forensic Mode</span>
                    <span style={{ marginLeft: 12 }}><StatusBadge success={log.success} /></span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: '#333',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                    }}
                >
                    ✕ Fechar
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '16px 20px' }}>
                {/* Meta */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        marginBottom: 16,
                        fontSize: 12,
                    }}
                >
                    <div><strong>Correlation ID:</strong> {log.correlationId}</div>
                    <div><strong>Codepath:</strong> <code style={{ color: '#ffd700' }}>{log.codepath}</code></div>
                    <div><strong>Duração:</strong> {log.totalDurationMs ? `${(log.totalDurationMs / 1000).toFixed(1)}s` : '—'}</div>
                    <div><strong>Refs:</strong> {log.referenceImageCount} imagens</div>
                </div>

                {/* Error */}
                {log.error && (
                    <div
                        style={{
                            background: '#3b0000',
                            border: '1px solid #ef4444',
                            borderRadius: 6,
                            padding: '10px 14px',
                            marginBottom: 16,
                            fontSize: 12,
                        }}
                    >
                        <strong>❌ ERRO:</strong> {log.error}
                    </div>
                )}

                {/* Provider */}
                <JsonBlock
                    title="📡 Provider (API Keys & Modelos)"
                    data={log.provider}
                    defaultOpen
                />

                {/* Hardcoded Values */}
                <JsonBlock
                    title="⚡ Valores Hardcoded / Defaults"
                    data={log.hardcodedValues}
                    defaultOpen
                />

                {/* System Prompt */}
                <JsonBlock
                    title="📝 System Prompt (Etapa 1 — COMPLETO)"
                    data={log.systemPromptExpanded}
                />

                {/* Input Config */}
                <JsonBlock
                    title="🎛️ Config de Entrada"
                    data={log.inputConfig}
                />

                {/* Composition Rules */}
                <JsonBlock
                    title={`🏗️ Regras de Composição Aplicadas (${log.compositionRulesApplied.length})`}
                    data={log.compositionRulesApplied.map((r, i) => `[${i + 1}] ${r}`).join('\n\n')}
                />

                {/* Steps */}
                {log.steps.map((step, i) => (
                    <JsonBlock
                        key={i}
                        title={`${step.step === 'prompt_text' ? '📖' : '🖼️'} Etapa: ${step.step} — ${step.responseStatus || '?'} (${step.responseTimeMs || '?'}ms)`}
                        data={{
                            status: step.responseStatus,
                            timeMs: step.responseTimeMs,
                            error: step.error || null,
                            totalAttempts: step.requests.length,
                            requests: step.requests.map(r => ({
                                url: r.url,
                                model: r.model,
                                attempt: r.attempt,
                                keyIndex: r.keyIndex,
                                body: r.body,
                            })),
                        }}
                    />
                ))}

                {/* Retry Diffs */}
                {retryDiffs.length > 0 && (
                    <JsonBlock
                        title={`🔁 Retry Diffs (${retryDiffs.length} retries)`}
                        data={retryDiffs}
                        defaultOpen
                    />
                )}

                {/* Full Prompt */}
                {log.steps.find(s => s.step === 'image_generation')?.requests?.[0]?.promptFinal && (
                    <JsonBlock
                        title="📋 Prompt Final Completo (Etapa 2)"
                        data={log.steps.find(s => s.step === 'image_generation')!.requests[0].promptFinal}
                    />
                )}

                {/* Raw JSON Download */}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `forensic_${log.correlationId}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        ⬇ Download request_final.json
                    </button>
                </div>
            </div>
        </div>
    );
}
