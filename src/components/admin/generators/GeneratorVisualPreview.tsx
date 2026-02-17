import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Type, Calendar, Palette, Upload, Grid3X3, Sparkles, Move, Maximize2 } from 'lucide-react';

interface OutputFormat {
  name: string;
  dimensions: { width: number; height: number };
  label: string;
}

interface TextLayer {
  id: string;
  label: string;
  defaultText: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  maxWidth?: number;
  draggable: boolean;
}

interface GeneratorConfig {
  dimensions?: { width: number; height: number };
  output_formats?: OutputFormat[];
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  features?: {
    upload?: boolean;
    multiple_slides?: boolean;
    draggable_text?: boolean;
    text_fields?: string[];
    preview?: boolean;
    output_format?: string;
  };
  text_layers?: TextLayer[];
  form_fields?: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
  }>;
}

interface Props {
  config: GeneratorConfig | null | undefined;
  name: string;
  type: string;
}

export function GeneratorVisualPreview({ config, name, type }: Props) {
  const outputFormats = config?.output_formats || [];
  const [selectedFormat, setSelectedFormat] = useState<string>(outputFormats[0]?.name || 'default');
  
  // Get dimensions based on selected format
  const dimensions = useMemo(() => {
    if (outputFormats.length > 0) {
      const format = outputFormats.find(f => f.name === selectedFormat);
      return format?.dimensions || config?.dimensions || { width: 1080, height: 1080 };
    }
    return config?.dimensions || { width: 1080, height: 1080 };
  }, [selectedFormat, outputFormats, config?.dimensions]);
  
  const colors = config?.colors || {};
  const features = config?.features || {};
  const formFields = config?.form_fields || [];
  const textLayers = config?.text_layers || [];

  // Calculate preview canvas scale
  const maxWidth = 260;
  const maxHeight = 380;
  const aspectRatio = dimensions.width / dimensions.height;
  
  const previewDimensions = useMemo(() => {
    if (aspectRatio > maxWidth / maxHeight) {
      return {
        width: maxWidth,
        height: maxWidth / aspectRatio,
      };
    }
    return {
      width: maxHeight * aspectRatio,
      height: maxHeight,
    };
  }, [aspectRatio]);

  // Get field icon
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'file':
        return <Upload className="h-3 w-3" />;
      case 'text':
      case 'textarea':
        return <Type className="h-3 w-3" />;
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'color':
        return <Palette className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  // Parse colors to display
  const colorPalette = Object.entries(colors).filter(([_, value]) => value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{type.replace('_', ' ')}</Badge>
          <span className="font-semibold text-lg">{name || 'Novo Gerador'}</span>
        </div>
        {outputFormats.length > 1 ? (
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <Maximize2 className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outputFormats.map((format) => (
                <SelectItem key={format.name} value={format.name}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {dimensions.width}×{dimensions.height}
          </Badge>
        )}
      </div>

      <div className="flex gap-6">
        {/* Canvas Preview */}
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Canvas Preview</p>
          <div
            className="relative border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60 overflow-hidden"
            style={{
              width: previewDimensions.width,
              height: previewDimensions.height,
            }}
          >
            {/* Background color hint */}
            {colors.background && (
              <div 
                className="absolute inset-0 opacity-30"
                style={{ backgroundColor: colors.background }}
              />
            )}
            
            {/* Grid overlay for visual structure */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-foreground/20" />
              ))}
            </div>

            {/* Text Layers Preview (draggable indicators) */}
            {textLayers.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="absolute flex items-center gap-1 text-[10px] bg-primary/90 text-primary-foreground px-2 py-0.5 rounded shadow-sm"
                    style={{
                      left: `${layer.position.x}%`,
                      top: `${layer.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {layer.draggable && <Move className="h-2.5 w-2.5" />}
                    <span className="truncate max-w-[80px]">{layer.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Placeholder elements based on form fields */}
            {textLayers.length === 0 && (
              <div className="relative z-10 flex flex-col items-center gap-3 p-4">
                {formFields.length > 0 ? (
                  <>
                    {formFields.slice(0, 4).map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50"
                      >
                        {getFieldIcon(field.type)}
                        <span className="truncate max-w-[120px]">{field.label}</span>
                      </div>
                    ))}
                    {formFields.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{formFields.length - 4} campos
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Preview visual</p>
                  </div>
                )}
              </div>
            )}

            {/* Dimension indicator */}
            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded">
              {dimensions.width}×{dimensions.height}
            </div>

            {/* Multi-slide indicator */}
            {features.multiple_slides && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Grid3X3 className="h-3 w-3" />
                  Multi
                </Badge>
              </div>
            )}
            
            {/* Draggable text indicator */}
            {features.draggable_text && textLayers.length > 0 && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="text-[10px] gap-1 bg-background/80">
                  <Move className="h-3 w-3" />
                  Arrastar
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 space-y-4">
          {/* Color Palette */}
          {colorPalette.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                <Palette className="h-3 w-3" /> Paleta de Cores
              </p>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1">
                    <div
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: color as string }}
                    />
                    <div className="text-xs">
                      <p className="font-medium capitalize">{name}</p>
                      <p className="text-muted-foreground uppercase">{color as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          {formFields.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                <Type className="h-3 w-3" /> Campos do Formulário ({formFields.length})
              </p>
              <ScrollArea className="h-[180px]">
                <div className="space-y-1.5 pr-2">
                  {formFields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center">
                        {getFieldIcon(field.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{field.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {field.type}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {field.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Text Layers */}
          {textLayers.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                <Type className="h-3 w-3" /> Campos de Texto ({textLayers.length})
              </p>
              <ScrollArea className="h-[120px]">
                <div className="space-y-1.5 pr-2">
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center">
                        {layer.draggable ? <Move className="h-3 w-3 text-primary" /> : <Type className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{layer.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {layer.defaultText}
                        </p>
                      </div>
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: layer.color }}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Features */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Recursos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {features.upload && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Upload className="h-3 w-3" /> Upload
                </Badge>
              )}
              {features.multiple_slides && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Grid3X3 className="h-3 w-3" /> Multi-slide
                </Badge>
              )}
              {features.draggable_text && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Move className="h-3 w-3" /> Texto Arrastável
                </Badge>
              )}
              {features.preview && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  Preview
                </Badge>
              )}
              {outputFormats.length > 1 && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Maximize2 className="h-3 w-3" /> {outputFormats.length} formatos
                </Badge>
              )}
              {features.output_format && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {features.output_format}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
