"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Layer {
  id: number;
  name: string;
  rank: number;
}

interface LayerSelectorProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelect: (layerId: string) => void;
  loading?: boolean;
}

export function LayerSelector({
  layers,
  selectedLayerId,
  onSelect,
  loading = false,
}: LayerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredLayers = searchQuery
    ? layers.filter((layer) =>
        layer.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : layers;

  const selectedLayer = layers.find((l) => String(l.id) === selectedLayerId);

  const handleSelect = (layerId: string) => {
    onSelect(layerId);
    setSearchQuery("");
    setOpen(false);
  };

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white/40" />
              <span className="text-white/40">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedLayer ? (
                <>
                  <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                    <Layers className="h-2.5 w-2.5 text-blue-400" />
                  </div>
                  <span className="truncate">{selectedLayer.name}</span>
                </>
              ) : (
                <span className="text-white/40">Select layer...</span>
              )}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-[#0a0a0c] border-white/10" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder="Search layers..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="bg-transparent text-white placeholder:text-white/40"
          />
          <CommandList>
            <CommandEmpty className="text-white/40 text-sm">No layer found.</CommandEmpty>
            <CommandGroup>
              {filteredLayers.map((layer) => (
                <CommandItem
                  key={layer.id}
                  value={String(layer.id)}
                  onSelect={() => handleSelect(String(layer.id))}
                  className="cursor-pointer text-white hover:bg-white/5"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                      <Layers className="h-2.5 w-2.5 text-blue-400" />
                    </div>
                    <span className="truncate">{layer.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedLayerId === String(layer.id) ? "opacity-100 text-blue-500" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}