"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string | null;
  selectedCompanyName: string | null;
  onSelect: (companyId: string | null, companyName: string) => void;
  onAddCompany: (name: string, logoUrl?: string) => Promise<string>;
  disabled?: boolean;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  selectedCompanyName,
  onSelect,
  onAddCompany,
  disabled = false,
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyLogo, setNewCompanyLogo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter companies based on search
  const filteredCompanies = searchQuery
    ? companies.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : companies;

  // Check if search query matches an existing company exactly
  const exactMatch = companies.find(
    (company) => company.name.toLowerCase() === searchQuery.toLowerCase()
  );

  // Check if we should show "Add new" option
  const showAddNew = searchQuery && !exactMatch;

  const handleSelect = (companyId: string, companyName: string) => {
    onSelect(companyId, companyName);
    setSearchQuery("");
    setOpen(false);
  };

  const handleAddNew = () => {
    setNewCompanyName(searchQuery);
    setShowAddDialog(true);
    setOpen(false);
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return;

    setIsSubmitting(true);
    try {
      const newId = await onAddCompany(newCompanyName.trim(), newCompanyLogo.trim() || undefined);
      onSelect(newId, newCompanyName.trim());
      setShowAddDialog(false);
      setNewCompanyName("");
      setNewCompanyLogo("");
    } catch (error) {
      console.error("Failed to create company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedCompanyId ? (
                (() => {
                  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
                  return selectedCompany?.logo_url ? (
                    <img
                      src={selectedCompany.logo_url}
                      alt={selectedCompany.name}
                      className="w-4 h-4 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <div className="w-4 h-4 shrink-0 rounded bg-muted flex items-center justify-center text-[10px] font-medium">
                      {(selectedCompanyName || selectedCompany?.name || "?").charAt(0).toUpperCase()}
                    </div>
                  );
                })()
              ) : (
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className={cn("truncate", !selectedCompanyName && "text-muted-foreground")}>
                {selectedCompanyName || "Select or add company..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder="Search companies..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No company found.</CommandEmpty>
              
              {filteredCompanies.length > 0 && (
                <CommandGroup heading="Existing Companies">
                  {filteredCompanies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id}
                      onSelect={() => handleSelect(company.id, company.name)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-5 h-5 rounded object-contain"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs">
                            {company.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">{company.name}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleAddNew}
                      className="cursor-pointer text-foreground"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add "{searchQuery}" as new company
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Add Company Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Create a new company to associate with this tool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g., Acme Inc."
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Logo URL (optional)</Label>
              <Input
                id="companyLogo"
                type="url"
                value={newCompanyLogo}
                onChange={(e) => setNewCompanyLogo(e.target.value)}
                placeholder="https://.../logo.png"
                className="h-10"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={!newCompanyName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Company"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
