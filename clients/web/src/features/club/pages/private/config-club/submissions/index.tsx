import { useClubOutlet } from '@/features/club/context/club-layout-context';
import { useApplication, useApplicationBulkActions, useApplications } from '@/features/club/hooks/applications.hooks';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "design/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckIcon, UserListIcon, XIcon } from '@hugeicons/core-free-icons';
import EmptyState from '@/shared/components/empty-state';
import { Button } from "design/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import { ChevronDownIcon } from 'lucide-react';
import { Checkbox } from "design/components/ui/checkbox"
import { cn } from 'design/lib/utils';
import { paths } from '@/settings/routes';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn';

const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Withdrawn', value: 'withdrawn' },
];

const FilterDropDown = ({
    value,
    onChange,
}: {
    value: StatusFilter;
    onChange: (value: StatusFilter) => void;
}) => {
    const currentLabel = FILTERS.find(f => f.value === value)?.label ?? 'All';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="glass" className={'rounded-full'}>
                    {currentLabel}
                    <ChevronDownIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuGroup>
                    {FILTERS.map((filter) => (
                        <DropdownMenuItem key={filter.value} onClick={() => onChange(filter.value)}>
                            {filter.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const ApplicationSubmissions = () => {
    const { club } = useClubOutlet();
    const { data: applications, isLoading } = useApplications(club?.id);
    const { bulkApplicationsApprove, bulkApplicationsReject } = useApplicationBulkActions(club.id)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
    const navigate = useNavigate();


    const filteredApplications = useMemo(() => {
        if (!applications) return [];
        if (statusFilter === 'all') return applications;
        return applications.filter((a) => a.status === statusFilter);
    }, [applications, statusFilter]);

    if (isLoading) return <>Loading...</>;

    if (applications.length === 0) {
        return (
            <div className="w-full">
                <EmptyState title="No Applications" description="No membership applications yet" icon={<HugeiconsIcon icon={UserListIcon} />}>
                    <Button variant="outline" onClick={() => navigate(paths.private.club.submissions.form(club?.slug))}>
                        Forms
                    </Button>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className=''>
            <div className="flex items-center justify-end gap-4 pb-4">
                <Button variant="outline" onClick={() => navigate(paths.private.club.submissions.form(club?.slug))}>
                    Forms
                </Button>
                <FilterDropDown value={statusFilter} onChange={setStatusFilter} />
            </div>
            <Table>
                <TableCaption>
                    <span className="text-muted-foreground">Showing {filteredApplications.length} applications </span>
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Checkbox
                                checked={
                                    filteredApplications.length > 0 &&
                                    selectedApplicants.size === filteredApplications.length &&
                                    filteredApplications.every(app => selectedApplicants.has(app.id))
                                }
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        const newSelected = new Set<string>();
                                        filteredApplications.filter(app => app.status === "pending").forEach(app => newSelected.add(app.id));
                                        setSelectedApplicants(newSelected);
                                    } else {
                                        setSelectedApplicants(new Set());
                                    }
                                }}
                            />
                        </TableHead>
                        <TableHead className="w-25">Applicant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied at</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Reviewed By</TableHead>
                    </TableRow>
                </TableHeader>
                {filteredApplications.length > 0 && (
                    filteredApplications.map((applicaition) => (
                        <TableBody key={applicaition.id}>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        disabled={applicaition.status !== "pending"}
                                        checked={selectedApplicants.has(applicaition.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedApplicants(prev => new Set([...prev, applicaition.id]));
                                            } else {
                                                setSelectedApplicants(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete(applicaition.id);
                                                    return newSet;
                                                });
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Avatar>
                                            <AvatarImage src={applicaition.applicant.avatar ?? undefined}></AvatarImage>
                                            <AvatarFallback>{applicaition.applicant.username[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {applicaition.applicant.username}
                                    </div>
                                </TableCell>
                                <TableCell className={`${applicaition.status === "approved" ? 'text-green-500' : 'text-orange-500'}`}>{applicaition.status}</TableCell>
                                <TableCell>{new Date(applicaition?.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</TableCell>
                                <TableCell className="text-muted-foreground">{applicaition.message}</TableCell>
                                <TableCell className="text-right">
                                    {applicaition.reviewed_at ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Avatar>
                                                <AvatarImage src={applicaition.reviewed_by?.avatar ?? undefined}></AvatarImage>
                                                <AvatarFallback>{applicaition.reviewed_by?.username?.[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            {applicaition.reviewed_by?.username}
                                        </div>
                                    ) : (
                                        <span className='text-muted-foreground'>---</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ))
                )}
            </Table>
            {selectedApplicants.size > 0 && (
                <div className={cn(
                    "absolute bottom-4 right-1/2 translate-x-1/2 z-50",
                    "bg-primary-foreground rounded-full px-6 py-2 shadow-md",
                    "flex items-center gap-4",
                    selectedApplicants.size > 0
                        ? "animate-[slideInUp_0.3s_ease-out]"
                        : "animate-[slideOutDown_0.3s_ease-out]",
                )} >
                    <span className='text-muted-foreground'>{selectedApplicants.size} selected</span>
                    <div className='flex gap-1 items-center'>
                        <Button
                            variant="glass"
                            onClick={() => {
                                const application_ids = Array.from(selectedApplicants);
                                bulkApplicationsApprove.mutate(application_ids, {
                                    onSuccess: () => {
                                        setSelectedApplicants(new Set());
                                    }
                                });
                            }}
                            className='rounded-full'
                        >
                            <HugeiconsIcon icon={CheckIcon} /> Approve
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                const application_ids = Array.from(selectedApplicants);
                                bulkApplicationsReject.mutate(application_ids, {
                                    onSuccess: () => {
                                        setSelectedApplicants(new Set());
                                    }
                                });
                            }}
                            className='rounded-full'
                        >
                            <HugeiconsIcon icon={XIcon} /> Reject
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationSubmissions;