<<<<<<< HEAD
import React, { useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUp, AlertCircle } from 'lucide-react';
import type { BriefingSchemaJson, BriefingFieldSchema } from '@/types/briefing-template';

interface DynamicBriefingFormProps {
    schema: BriefingSchemaJson;
    values: Record<string, unknown>;
    onChange: (values: Record<string, unknown>) => void;
    readOnly?: boolean;
}

export function DynamicBriefingForm({ schema, values, onChange, readOnly = false }: DynamicBriefingFormProps) {
    const completenessScore = useMemo(() => {
        if (!schema.fields.length) return 100;
        const requiredFields = schema.fields.filter(f => f.required);
        if (!requiredFields.length) return 100;
        const filledRequired = requiredFields.filter(f => {
            const val = values[f.key];
            return val !== undefined && val !== null && val !== '';
        });
        return Math.round((filledRequired.length / requiredFields.length) * 100);
    }, [schema, values]);

    const handleFieldChange = useCallback((key: string, value: unknown) => {
        onChange({ ...values, [key]: value });
    }, [values, onChange]);

    return (
        <div className="space-y-5">
            {/* Completeness bar */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Completude do Briefing</span>
                    <span className={`text-sm font-mono font-medium ${completenessScore === 100 ? 'text-green-400' : 'text-[#CCFF00]'
                        }`}>
                        {completenessScore}%
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${completenessScore === 100
                                ? 'bg-green-400'
                                : 'bg-gradient-to-r from-[#CCFF00] to-[#CCFF00]/60'
                            }`}
                        style={{ width: `${completenessScore}%` }}
                    />
                </div>
            </div>

            {/* Fields */}
            {schema.fields.map((field) => (
                <BriefingField
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    onChange={(val) => handleFieldChange(field.key, val)}
                    readOnly={readOnly}
                />
            ))}

            {schema.fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm">Nenhum campo configurado neste template</p>
                </div>
            )}
        </div>
    );
}

// Componente individual de campo
function BriefingField({ field, value, onChange, readOnly }: {
    field: BriefingFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    readOnly: boolean;
}) {
    const strValue = typeof value === 'string' ? value : '';
    const numValue = typeof value === 'number' ? value : undefined;
    const boolValue = typeof value === 'boolean' ? value : false;

    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 flex items-center gap-1.5">
                {field.label}
                {field.required && (
                    <span className="text-[#CCFF00] text-[10px]">*</span>
                )}
            </Label>
            {field.description && (
                <p className="text-[11px] text-gray-500 -mt-0.5">{field.description}</p>
            )}

            {/* Text */}
            {field.type === 'text' && (
                <Input
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* URL */}
            {field.type === 'url' && (
                <Input
                    type="url"
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || 'https://...'}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Textarea */}
            {field.type === 'textarea' && (
                <Textarea
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10 min-h-[80px]"
                />
            )}

            {/* Number */}
            {field.type === 'number' && (
                <Input
                    type="number"
                    value={numValue ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={field.placeholder || ''}
                    min={field.min}
                    max={field.max}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Date */}
            {field.type === 'date' && (
                <Input
                    type="date"
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Select */}
            {field.type === 'select' && (
                <Select
                    value={strValue}
                    onValueChange={onChange}
                    disabled={readOnly}
                >
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                        <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/[0.08]">
                        {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-white hover:bg-white/10">
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Checkbox */}
            {field.type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={boolValue}
                        onCheckedChange={onChange}
                        disabled={readOnly}
                        className="border-white/20 data-[state=checked]:bg-[#CCFF00] data-[state=checked]:border-[#CCFF00]"
                    />
                    <span className="text-sm text-gray-400">{field.placeholder || 'Sim'}</span>
                </div>
            )}

            {/* Color Picker */}
            {field.type === 'color_picker' && (
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={strValue || '#CCFF00'}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={readOnly}
                        className="w-10 h-10 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer"
                    />
                    <Input
                        value={strValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#CCFF00"
                        disabled={readOnly}
                        className="bg-white/[0.03] border-white/[0.08] text-white font-mono text-sm
              focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10 flex-1"
                    />
                </div>
            )}

            {/* File Upload placeholder */}
            {field.type === 'file_upload' && (
                <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-4 
          flex flex-col items-center gap-2 bg-white/[0.02] hover:border-[#CCFF00]/20 
          transition-colors cursor-pointer">
                    <FileUp className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-500">
                        Arraste arquivos ou clique para enviar
                        {field.max && ` (máx. ${field.max})`}
                    </span>
                </div>
            )}
        </div>
    );
}
=======
import React, { useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUp, AlertCircle } from 'lucide-react';
import type { BriefingSchemaJson, BriefingFieldSchema } from '@/types/briefing-template';

interface DynamicBriefingFormProps {
    schema: BriefingSchemaJson;
    values: Record<string, unknown>;
    onChange: (values: Record<string, unknown>) => void;
    readOnly?: boolean;
}

export function DynamicBriefingForm({ schema, values, onChange, readOnly = false }: DynamicBriefingFormProps) {
    const completenessScore = useMemo(() => {
        if (!schema.fields.length) return 100;
        const requiredFields = schema.fields.filter(f => f.required);
        if (!requiredFields.length) return 100;
        const filledRequired = requiredFields.filter(f => {
            const val = values[f.key];
            return val !== undefined && val !== null && val !== '';
        });
        return Math.round((filledRequired.length / requiredFields.length) * 100);
    }, [schema, values]);

    const handleFieldChange = useCallback((key: string, value: unknown) => {
        onChange({ ...values, [key]: value });
    }, [values, onChange]);

    return (
        <div className="space-y-5">
            {/* Completeness bar */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Completude do Briefing</span>
                    <span className={`text-sm font-mono font-medium ${completenessScore === 100 ? 'text-green-400' : 'text-[#CCFF00]'
                        }`}>
                        {completenessScore}%
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${completenessScore === 100
                                ? 'bg-green-400'
                                : 'bg-gradient-to-r from-[#CCFF00] to-[#CCFF00]/60'
                            }`}
                        style={{ width: `${completenessScore}%` }}
                    />
                </div>
            </div>

            {/* Fields */}
            {schema.fields.map((field) => (
                <BriefingField
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    onChange={(val) => handleFieldChange(field.key, val)}
                    readOnly={readOnly}
                />
            ))}

            {schema.fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm">Nenhum campo configurado neste template</p>
                </div>
            )}
        </div>
    );
}

// Componente individual de campo
function BriefingField({ field, value, onChange, readOnly }: {
    field: BriefingFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    readOnly: boolean;
}) {
    const strValue = typeof value === 'string' ? value : '';
    const numValue = typeof value === 'number' ? value : undefined;
    const boolValue = typeof value === 'boolean' ? value : false;

    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 flex items-center gap-1.5">
                {field.label}
                {field.required && (
                    <span className="text-[#CCFF00] text-[10px]">*</span>
                )}
            </Label>
            {field.description && (
                <p className="text-[11px] text-gray-500 -mt-0.5">{field.description}</p>
            )}

            {/* Text */}
            {field.type === 'text' && (
                <Input
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* URL */}
            {field.type === 'url' && (
                <Input
                    type="url"
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || 'https://...'}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Textarea */}
            {field.type === 'textarea' && (
                <Textarea
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10 min-h-[80px]"
                />
            )}

            {/* Number */}
            {field.type === 'number' && (
                <Input
                    type="number"
                    value={numValue ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={field.placeholder || ''}
                    min={field.min}
                    max={field.max}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Date */}
            {field.type === 'date' && (
                <Input
                    type="date"
                    value={strValue}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={readOnly}
                    className="bg-white/[0.03] border-white/[0.08] text-white
            focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10"
                />
            )}

            {/* Select */}
            {field.type === 'select' && (
                <Select
                    value={strValue}
                    onValueChange={onChange}
                    disabled={readOnly}
                >
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                        <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/[0.08]">
                        {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-white hover:bg-white/10">
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Checkbox */}
            {field.type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={boolValue}
                        onCheckedChange={onChange}
                        disabled={readOnly}
                        className="border-white/20 data-[state=checked]:bg-[#CCFF00] data-[state=checked]:border-[#CCFF00]"
                    />
                    <span className="text-sm text-gray-400">{field.placeholder || 'Sim'}</span>
                </div>
            )}

            {/* Color Picker */}
            {field.type === 'color_picker' && (
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={strValue || '#CCFF00'}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={readOnly}
                        className="w-10 h-10 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer"
                    />
                    <Input
                        value={strValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#CCFF00"
                        disabled={readOnly}
                        className="bg-white/[0.03] border-white/[0.08] text-white font-mono text-sm
              focus:border-[#CCFF00]/40 focus:ring-[#CCFF00]/10 flex-1"
                    />
                </div>
            )}

            {/* File Upload placeholder */}
            {field.type === 'file_upload' && (
                <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-4 
          flex flex-col items-center gap-2 bg-white/[0.02] hover:border-[#CCFF00]/20 
          transition-colors cursor-pointer">
                    <FileUp className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-500">
                        Arraste arquivos ou clique para enviar
                        {field.max && ` (máx. ${field.max})`}
                    </span>
                </div>
            )}
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
