import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image, Type, Calendar, Palette, Upload, Grid3X3, Sparkles } from 'lucide-react';

interface GeneratorConfig {
  dimensions?: { width: number; height: number };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  features?: {
    upload?: boolean;
    multiple_slides?: boolean;
    text_fields?: string[];
    preview?: boolean;
    output_format?: string;
  };
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
  const dimensions = config?.dimensions || { width: 1080, height: 1080 };
  const colors = config?.colors || {};
  const features = config?.features || {};
  const formFields = config?.form_fields || [];

  // Calculate preview canvas scale
  const maxWidth = 280;
  const maxHeight = 400;
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
          <Badge variant="outline" className="capitalize">{type}</Badge>
          <span className="font-semibold text-lg">{name || 'Novo Gerador'}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {dimensions.width}×{dimensions.height}
        </Badge>
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

            {/* Placeholder elements based on form fields */}
            <div className="relative z-10 flex flex-col items-center gap-3 p-4">
              {formFields.length > 0 ? (
                <>
                  {formFields.slice(0, 4).map((field, idx) => (
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
              {features.preview && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  Preview
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
