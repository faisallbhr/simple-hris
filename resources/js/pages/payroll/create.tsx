import SelectSearch from '@/components/select-search';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { cn, formatDate, parseDate } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface PayrollDetails {
    allowances: Record<string, number>;
    deductions: Record<string, number>;
    bonus: number;
}

interface DynamicField {
    id: string;
    name: string;
    value: number;
}

interface UserOption {
    value: string;
    label: string;
    department: string;
    email: string;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        period_start: '',
        period_end: '',
        base_salary: '',
        details: '',
    });

    // user query
    const [searchQuery, setSearchQuery] = useState('');
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // dynamic fields for payroll details
    const [allowances, setAllowances] = useState<DynamicField[]>([]);
    const [deductions, setDeductions] = useState<DynamicField[]>([]);
    const [bonus, setBonus] = useState<number>(0);

    useEffect(() => {
        if (!searchQuery) {
            setUserOptions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            setLoadingUsers(true);

            fetch(route('users.search') + `?query=${encodeURIComponent(searchQuery)}`)
                .then((res) => res.json())
                .then((data) => {
                    const options = data.map((user: any) => ({
                        value: user.id,
                        label: user.name,
                        department: user.department.name,
                        email: user.email,
                    }));
                    setUserOptions(options);
                })
                .finally(() => setLoadingUsers(false));
        }, 300);
    }, [searchQuery]);

    const [openCalendar, setOpenCalendar] = useState({
        start: false,
        end: false,
    });

    const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addField = useCallback((type: 'allowances' | 'deductions') => {
        const newField: DynamicField = {
            id: generateId(),
            name: '',
            value: 0,
        };

        if (type === 'allowances') {
            setAllowances((prev) => [...prev, newField]);
        } else {
            setDeductions((prev) => [...prev, newField]);
        }
    }, []);

    const removeField = useCallback((type: 'allowances' | 'deductions', id: string) => {
        if (type === 'allowances') {
            setAllowances((prev) => prev.filter((field) => field.id !== id));
        } else {
            setDeductions((prev) => prev.filter((field) => field.id !== id));
        }
    }, []);

    const updateFieldName = useCallback((type: 'allowances' | 'deductions', id: string, name: string) => {
        const updateFields = (fields: DynamicField[]) => fields.map((field) => (field.id === id ? { ...field, name } : field));

        if (type === 'allowances') {
            setAllowances(updateFields);
        } else {
            setDeductions(updateFields);
        }
    }, []);

    const updateFieldValue = useCallback((type: 'allowances' | 'deductions', id: string, value: number) => {
        const updateFields = (fields: DynamicField[]) => fields.map((field) => (field.id === id ? { ...field, value } : field));

        if (type === 'allowances') {
            setAllowances(updateFields);
        } else {
            setDeductions(updateFields);
        }
    }, []);

    const detailsJson = useMemo(() => {
        const details: PayrollDetails = {
            allowances: {},
            deductions: {},
            bonus,
        };

        allowances.forEach((field) => {
            if (field.name.trim()) {
                details.allowances[field.name.trim()] = field.value;
            }
        });

        deductions.forEach((field) => {
            if (field.name.trim()) {
                details.deductions[field.name.trim()] = field.value;
            }
        });

        return JSON.stringify(details);
    }, [allowances, deductions, bonus]);

    useEffect(() => {
        setData('details', detailsJson);
    }, [detailsJson, setData]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hasEmptyNames = [...allowances, ...deductions].some((field) => field.name.trim() === '' && field.value !== 0);

        if (hasEmptyNames) {
            alert('Please provide names for all allowance and deduction fields');
            return;
        }

        post(route('payrolls.store'));
    };

    const renderDynamicFields = (type: 'allowances' | 'deductions', fields: DynamicField[], title: string) => (
        <div className="ml-1 space-y-1">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium capitalize">&bull; {title}</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addField(type)} className="h-8 px-3">
                    <Plus className="mr-1 h-3 w-3" />
                    Add {title.slice(0, -1)}
                </Button>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} added yet</p>
            ) : (
                <div className="space-y-2">
                    {fields.map((field) => (
                        <div key={field.id} className="flex items-center gap-2 rounded-md border p-2">
                            <Input
                                placeholder="Field name"
                                value={field.name}
                                onChange={(e) => updateFieldName(type, field.id, e.target.value)}
                                className="w-60"
                            />
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={field.value || ''}
                                onChange={(e) => updateFieldValue(type, field.id, Number(e.target.value) || 0)}
                                className="flex-1"
                            />
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeField(type, field.id)} className="h-8 w-8 p-0">
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AppLayout>
            <Head title="Create Payroll" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link href="/payrolls">
                                <BreadcrumbPage>Payroll</BreadcrumbPage>
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Create</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mx-auto w-full space-y-6 rounded-lg border p-6 shadow-sm">
                    <h1 className="text-center text-2xl font-semibold">Create Payroll</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* employee selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Employee</Label>
                            <SelectSearch
                                value={data.employee_id}
                                onChange={(value) => setData('employee_id', value ?? '')}
                                placeholder="employees"
                                className="text-sm"
                                options={userOptions}
                                isLoading={loadingUsers}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />

                            {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                        </div>

                        {/* period start */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Period Start</Label>
                            <Popover open={openCalendar.start} onOpenChange={(open) => setOpenCalendar((prev) => ({ ...prev, start: open }))}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !data.period_start && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.period_start ? format(new Date(data.period_start), 'PPP') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={parseDate(data.period_start)}
                                        onSelect={(date) => {
                                            if (date) {
                                                setData('period_start', formatDate(date));
                                                setOpenCalendar((prev) => ({ ...prev, start: false }));
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.period_start && <p className="text-sm text-red-500">{errors.period_start}</p>}
                        </div>

                        {/* period end */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Period End</Label>
                            <Popover open={openCalendar.end} onOpenChange={(open) => setOpenCalendar((prev) => ({ ...prev, end: open }))}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !data.period_end && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.period_end ? format(new Date(data.period_end), 'PPP') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={parseDate(data.period_end)}
                                        onSelect={(date) => {
                                            if (date) {
                                                setData('period_end', formatDate(date));
                                                setOpenCalendar((prev) => ({ ...prev, end: false }));
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.period_end && <p className="text-sm text-red-500">{errors.period_end}</p>}
                        </div>

                        {/* sase salary */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Base Salary</Label>
                            <Input
                                type="number"
                                value={data.base_salary}
                                onChange={(e) => setData('base_salary', e.target.value)}
                                placeholder="Enter base salary"
                            />
                            {errors.base_salary && <p className="text-sm text-red-500">{errors.base_salary}</p>}
                        </div>

                        {/* details */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">
                                Details <span className="text-muted-foreground">(optional)</span>
                            </Label>

                            {/* allowances */}
                            {renderDynamicFields('allowances', allowances, 'Allowances')}

                            {/* deductions */}
                            {renderDynamicFields('deductions', deductions, 'Deductions')}

                            {/* bonus */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Bonus <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    type="number"
                                    value={bonus || ''}
                                    onChange={(e) => setBonus(Number(e.target.value) || 0)}
                                    placeholder="Enter bonus amount"
                                />
                            </div>

                            {errors.details && <p className="text-sm text-red-500">{errors.details}</p>}
                        </div>

                        <Button type="submit" disabled={processing} className="w-full cursor-pointer">
                            {processing ? 'Saving...' : 'Create Payroll'}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
