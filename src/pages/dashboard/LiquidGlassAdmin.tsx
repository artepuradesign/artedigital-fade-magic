import React from 'react';
import { toast } from 'sonner';
import { useLiquidGlass, defaultLiquidGlassConfig, LiquidGlassConfig } from '@/contexts/LiquidGlassContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Droplets, Eye, Save } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useSiteTheme } from '@/contexts/SiteThemeContext';
import MatrixRainBackground from '@/components/effects/MatrixRainBackground';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';


interface SliderParam {
  key: keyof LiquidGlassConfig;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const sliderParams: SliderParam[] = [
  { key: 'strength', label: 'Strength', min: 0, max: 50, step: 1, unit: 'px' },
  { key: 'softness', label: 'Softness', min: 0, max: 50, step: 1, unit: 'px' },
  { key: 'extraBlur', label: 'Extra Blur', min: 0, max: 20, step: 1, unit: 'px' },
  { key: 'tinting', label: 'Tinting', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'tintSaturation', label: 'Tint Saturation', min: 0, max: 400, step: 1, unit: '%' },
  { key: 'tintHue', label: 'Tint Hue', min: 0, max: 360, step: 1, unit: '°' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, unit: '%' },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1, unit: '%' },
  { key: 'invert', label: 'Invert', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'edgeSpecularity', label: 'Edge Specularity', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'cornerRadius', label: 'Corner Radius', min: 0, max: 100, step: 1, unit: 'px' },
  { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'backgroundAlpha', label: 'Transparência do Botão', min: 0, max: 100, step: 1, unit: '%' },
];

const LiquidGlassAdmin = () => {
  const { config, updateParam, resetToDefaults } = useLiquidGlass();
  const { currentVisualTheme } = useSiteTheme();
  const isMatrix = currentVisualTheme === 'matrix';

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Liquid Glass"
        subtitle="Configure o estilo Liquid Glass dos elementos do sistema"
        icon={<Droplets className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast.success('Configurações salvas!')}
            className="rounded-full h-9 w-9"
            aria-label="Salvar"
            title="Salvar"
          >
            <Save className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customize Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Customize</CardTitle>
              <CardDescription>Ajuste os parâmetros do efeito Liquid Glass</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {sliderParams.map((param) => (
              <div key={param.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">{param.label}</label>
                  <span className="text-sm font-semibold tabular-nums min-w-[60px] text-right">
                    {config[param.key]}{param.unit}
                  </span>
                </div>
                <Slider
                  value={[config[param.key]]}
                  onValueChange={([v]) => updateParam(param.key, v)}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-4 w-4" />
              Preview
            </CardTitle>
            <CardDescription>Visualize o efeito em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview area with theme-aware background */}
            <div
              className="relative rounded-xl overflow-hidden p-8 min-h-[350px] flex flex-col items-center justify-center gap-6"
              style={isMatrix ? { background: '#000' } : {
                background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 50%, hsl(var(--accent)) 100%)',
              }}
            >
              {/* Matrix: animated rain background; Default: decorative circles */}
              {isMatrix ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <MatrixRainBackground />
                </div>
              ) : (
                <>
                  <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-primary/20 blur-xl" />
                  <div className="absolute bottom-12 right-12 w-40 h-40 rounded-full bg-accent/30 blur-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-secondary/40 blur-xl" />
                </>
              )}

              {/* Glass Card Preview */}
              <div
                className="relative z-10 p-6 border border-white/20 shadow-xl max-w-sm w-full text-center"
                style={{
                  borderRadius: `${config.cornerRadius}px`,
                  backdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
                  WebkitBackdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
                  background: `rgba(255,255,255,${config.backgroundAlpha / 100})`,
                  boxShadow: `0 0 ${config.softness}px rgba(255,255,255,${config.edgeSpecularity / 200}), inset 0 1px 0 rgba(255,255,255,${config.edgeSpecularity / 300})`,
                  opacity: config.opacity / 100,
                }}
              >
                <p className="text-base font-semibold text-foreground/90">Liquid Glass Preview</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Este card reflete todas as configurações em tempo real.
                </p>
              </div>
            </div>

            {/* Button preview - separate from the card */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-muted-foreground">Preview do Botão</p>
              <LiquidGlassButton variant="primary">
                Botão Liquid Glass
              </LiquidGlassButton>
            </div>

            {/* Current Config Summary */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Configuração Atual</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                {sliderParams.map((param) => (
                  <div key={param.key} className="flex justify-between gap-1">
                    <span className="text-muted-foreground truncate">{param.label}:</span>
                    <span className="font-mono font-medium">{config[param.key]}{param.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiquidGlassAdmin;
