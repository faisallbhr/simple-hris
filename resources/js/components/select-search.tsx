import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { useState } from 'react';

interface Option {
    value: string;
    label: string;
    department: string;
    email: string;
}

interface SelectSearchProps {
    value?: string;
    onChange: (value: string | null) => void;
    placeholder?: string;
    className?: string;
    options: Option[];
    isLoading?: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function SelectSearch({
    value,
    onChange,
    placeholder,
    className,
    options,
    isLoading = false,
    searchQuery,
    setSearchQuery,
}: SelectSearchProps) {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value) ?? null;

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue === value ? null : selectedValue);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 opacity-50" />
                        <span className={cn('flex-1 truncate text-left', !selectedOption && 'text-muted-foreground')}>
                            {selectedOption ? selectedOption.label : `Search ${placeholder}...`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {selectedOption && <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Type to search..." value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList>
                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                                Loading {placeholder}...
                            </div>
                        )}
                        {!isLoading && options.length === 0 && searchQuery && <CommandEmpty>No {placeholder} found.</CommandEmpty>}
                        {!isLoading && options.length === 0 && !searchQuery && (
                            <div className="py-6 text-center text-sm text-muted-foreground">Start typing to search {placeholder}</div>
                        )}
                        {!isLoading && options.length > 0 && (
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => handleSelect(option.value)}
                                        className="cursor-pointer"
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                        <User className="mr-2 h-4 w-4 flex-shrink-0 opacity-50" />
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium">{option.label}</span>
                                            <span className="truncate text-xs text-muted-foreground">{option.email}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
