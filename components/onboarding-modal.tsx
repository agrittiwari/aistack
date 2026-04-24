"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  Layers,
  Sparkles,
  Cpu,
  Brain,
  Zap,
  Dna,
  Database,
  GitBranch,
  Code,
  ShieldCheck,
  Terminal,
  Video,
  Mic,
  MessageCircle,
  type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  cpu: Cpu,
  brain: Brain,
  zap: Zap,
  dna: Dna,
  database: Database,
  "git-branch": GitBranch,
  code: Code,
  "shield-check": ShieldCheck,
  terminal: Terminal,
  video: Video,
  mic: Mic,
  message: MessageCircle,
};

function LayerIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = name ? ICON_MAP[name] : null;
  if (!Icon) return <Layers className={className} />;
  return <Icon className={className} />;
}

interface Layer {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  color_gradient?: string | null;
  icon_name?: string | null;
}

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layers: Layer[];
  onComplete: (data: {
    interested_layer_ids: number[];
    primary_layer_id: number | null;
  }) => Promise<void>;
  saving?: boolean;
}

export function OnboardingModal({
  open,
  onOpenChange,
  layers,
  onComplete,
  saving = false,
}: OnboardingModalProps) {
  const [step, setStep] = useState<"interests" | "primary">("interests");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [primaryId, setPrimaryId] = useState<number | null>(null);

  const toggleLayer = (id: number) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (!next.includes(primaryId ?? -1)) {
        setPrimaryId(null);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (selectedIds.length === 0) return;
    setStep("primary");
  };

  const handleBack = () => {
    setStep("interests");
    setPrimaryId(null);
  };

  const handleFinish = async () => {
    if (!primaryId) return;
    onOpenChange(false); // close immediately (optimistic)
    await onComplete({
      interested_layer_ids: selectedIds,
      primary_layer_id: primaryId,
    });
  };

  const canProceed = selectedIds.length > 0;
  const canFinish = primaryId !== null;

  useMemo(() => {
    if (open) {
      setStep("interests");
      setSelectedIds([]);
      setPrimaryId(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            {step === "interests" ? (
              <Layers className="w-4 h-4 text-foreground" />
            ) : (
              <Sparkles className="w-4 h-4 text-foreground" />
            )}
            <DialogTitle className="text-base font-semibold">
              {step === "interests"
                ? "What are you interested in?"
                : "What do you work on?"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {step === "interests"
              ? "Select the stack layers you care about. You can change this anytime."
              : "Pick your primary focus — the layer that best describes what you build."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-3">
          {step === "interests" ? (
            <div className="grid grid-cols-2 gap-2">
              {layers.map((layer) => {
                const isSelected = selectedIds.includes(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`
                      group relative flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all
                      ${
                        isSelected
                          ? "border-foreground/20 bg-muted"
                          : "border-border/60 bg-card hover:border-foreground/15"
                      }
                    `}
                  >
                    <div
                      className={`w-7 h-7 rounded-md bg-gradient-to-br ${
                        layer.color_gradient || "from-gray-400 to-gray-300"
                      } flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <LayerIcon
                        name={layer.icon_name}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <span className="text-xs font-medium leading-tight flex-1 min-w-0">
                      {layer.name}
                    </span>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-background" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground mb-2">
                Select one layer that represents your main field:
              </p>
              {layers
                .filter((l) => selectedIds.includes(l.id))
                .map((layer) => {
                  const isPrimary = primaryId === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setPrimaryId(layer.id)}
                      className={`
                        w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all
                        ${
                          isPrimary
                            ? "border-foreground/20 bg-muted"
                            : "border-border/60 bg-card hover:border-foreground/15"
                        }
                      `}
                    >
                      <div
                        className={`w-6 h-6 rounded bg-gradient-to-br ${
                          layer.color_gradient || "from-gray-400 to-gray-300"
                        } flex items-center justify-center text-white`}
                      >
                        <LayerIcon
                          name={layer.icon_name}
                          className="w-3 h-3"
                        />
                      </div>
                      <span className="text-xs font-medium flex-1">
                        {layer.name}
                      </span>
                      {isPrimary && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5"
                        >
                          Primary
                        </Badge>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border shrink-0 flex justify-between items-center bg-background">
          {step === "primary" ? (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === "interests" ? (
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={!canProceed}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={!canFinish || saving}
              onClick={handleFinish}
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Finish
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
