import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Tabs,
  Text,
  Select,
  TextInput,
  Table,
  Pagination,
  Group,
  ActionIcon,
  Checkbox,
  Box,
  Paper,
  Container,
  Flex,
  Menu,
  Popover,
  Skeleton,
} from '@mantine/core';
import { Search, ChevronDown } from 'lucide-react';
import { IoIosArrowDown } from "react-icons/io";
import SecurityTable from '../../components/layout/SecurityTable';
import { SortIcon, FilterIcon } from '../../components/common/Svgs';
import { FaCalendarAlt } from 'react-icons/fa';
import { useAdminBackups, useCreateManualBackup, useRestoreBackup, useDeleteBackup, useAdminAuditLogs, useDeleteAuditLog, useSafeRestoreBackup } from '../../hooks/useAdmin';
import { adminAPI } from '../../services/adminAPI';
import { toast } from 'sonner';
import CommonModal from '../../components/common/CommonModal';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';

const Security = () => {
    const { tc } = useBatchTranslation();
    const [activeTab, setActiveTab] = useState('automatic-backups');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [activePage, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedRows, setSelectedRows] = useState([]);
    const [backupFrequency, setBackupFrequency] = useState('Daily');
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressPhase, setProgressPhase] = useState('');
    const [progressTitle, setProgressTitle] = useState('');
    const [progressIntervalId, setProgressIntervalId] = useState(null);
    const [progressNonDismissable, setProgressNonDismissable] = useState(false);
    const [progressOperation, setProgressOperation] = useState(null); // 'backup' | 'restore'

    // API hooks for audit logs
    const auditLogsParams = useMemo(() => {
        const params = {
            page: activePage,
            limit: itemsPerPage,
        };
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        if (dateRange[0] && dateRange[1]) {
            params.startDate = dateRange[0];
            params.endDate = dateRange[1];
        }
        
        if (sortConfig.key) {
            params.sortBy = sortConfig.key;
            params.sortOrder = sortConfig.direction;
        }
        
        return params;
    }, [activePage, itemsPerPage, searchQuery, dateRange, sortConfig]);

    const { data: auditLogsData, isLoading: auditLogsLoading } = useAdminAuditLogs(auditLogsParams);
    const deleteAuditLogMutation = useDeleteAuditLog();

    // API hooks for backups
    const { data: backupsData, isLoading: backupsLoading } = useAdminBackups();
    const createManualBackupMutation = useCreateManualBackup();
    const restoreBackupMutation = useRestoreBackup();
    const safeRestoreBackupMutation = useSafeRestoreBackup();
    const deleteBackupMutation = useDeleteBackup();

    const handleManualBackup = () => {
        setProgressTitle('Manual Backup');
        setProgressPercent(0);
        setProgressPhase('');
        setProgressModalOpen(true);
        setProgressNonDismissable(true);
        setProgressOperation('backup');

        // Start polling for in-progress backups to show percent (best-effort)
        const id = setInterval(async () => {
            try {
                const res = await adminAPI.getAllBackups();
                const backups = res?.data?.backups || res?.data?.data?.backups || [];
                // Pick the latest in-progress backup
                const latest = backups
                  .filter((b) => (b.status === 'in_progress' || b.backupStatus === 'in_progress'))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                if (latest) {
                    const pct = latest.backupProgress ?? 0;
                    const phase = latest.backupPhase ?? '';
                    setProgressPercent(Math.min(100, Math.max(0, pct)));
                    setProgressPhase(phase);
                }
            } catch (e) {
                // Silent polling error
            }
        }, 1200);
        setProgressIntervalId(id);

        createManualBackupMutation.mutate({ type: backupFrequency.toLowerCase() }, {
            onSettled: () => {
                if (id) clearInterval(id);
                setProgressIntervalId(null);
                setProgressModalOpen(false);
                setProgressPercent(0);
                setProgressPhase('');
                setProgressNonDismissable(false);
            }
        });
    };

    const handleRestoreBackup = () => {
        if (!lastBackup) {
            toast.error(tc('noBackupAvailableToRestore'));
            return;
        }
        setRestoreModalOpen(true);
    };

    const confirmRestore = () => {
        if (lastBackup) {
            setProgressTitle('Restore Backup');
            setProgressPercent(0);
            setProgressPhase('');
            setProgressModalOpen(true);
            setProgressNonDismissable(false);
            setProgressOperation('restore');

            // Start polling specific backup for restore progress
            const id = setInterval(async () => {
                try {
                    const res = await adminAPI.getBackupById(lastBackup._id);
                    const b = res?.data?.data || res?.data; // SuccessHandler may wrap
                    const pct = b?.restoreProgress ?? 0;
                    const phase = b?.restorePhase ?? '';
                    const status = b?.restoreStatus ?? 'idle';
                    setProgressPercent(Math.min(100, Math.max(0, pct)));
                    setProgressPhase(phase);
                    if (status === 'completed' || status === 'failed') {
                        clearInterval(id);
                        setProgressIntervalId(null);
                        setProgressModalOpen(false);
                    }
                } catch (e) {
                    // Silent polling error
                }
            }, 1200);
            setProgressIntervalId(id);

            restoreBackupMutation.mutate(lastBackup._id, {
                onError: (error) => {
                    const msg = error?.response?.data?.message || '';
                    // If it fails due to invalid notification enum, offer safe restore
                    if (msg.includes('Notification validation failed') || msg.includes('is not a valid enum value for path `type`')) {
                        // Run the safe restore path
                        safeRestoreBackupMutation.mutate(lastBackup._id);
                    }
                },
                onSettled: () => {
                    if (progressIntervalId) {
                        clearInterval(progressIntervalId);
                        setProgressIntervalId(null);
                    }
                    setProgressModalOpen(false);
                    setProgressPercent(0);
                    setProgressPhase('');
                    setProgressNonDismissable(false);
                }
            });
        }
        setRestoreModalOpen(false);
    };

    const handleDeleteBackup = (backupId) => {
        deleteBackupMutation.mutate(backupId);
    };
    
    const lastBackup = useMemo(() => {
        if (backupsData?.data?.backups && backupsData.data.backups.length > 0) {
            const sortedBackups = [...backupsData.data.backups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return sortedBackups[0];
        }
        return null;
    }, [backupsData]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setPage(1); // Reset to first page when sorting
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.currentTarget.value);
        setPage(1); // Reset to first page when searching
    };

    const handleDateRangeChange = (index, value) => {
        const newDateRange = [...dateRange];
        newDateRange[index] = value;
        setDateRange(newDateRange);
        setPage(1); // Reset to first page when filtering by date
    };

    const resetDateRange = () => {
        setDateRange([null, null]);
        setPage(1); // Reset to first page when clearing filters
    };

    // Get audit logs data from API response
    const activityLogs = useMemo(() => {
        if (auditLogsData?.data?.logs) {
            return auditLogsData.data.logs.map(log => ({
                id: log.id, // Keep full ID for API operations
                displayId: log.id.slice(-5), // Show last 5 characters of ID in UI
                date: new Date(log.date).toISOString().split('T')[0],
                user: log.actionBy !== 'undefined undefined' ? log.actionBy : log.entityName || tc('system'),
                action: log.reason // Show only the reason
            }));
        }
        return [];
    }, [auditLogsData, tc]);

    const handleDelete = (idToDelete) => {
        deleteAuditLogMutation.mutate(idToDelete, {
            onSuccess: () => {
                setSelectedRows((currentSelected) => currentSelected.filter((id) => id !== idToDelete));
            }
        });
    };

    // For client-side filtering when API doesn't support all filters
    const sortedAndFilteredData = useMemo(() => {   
        let result = [...activityLogs];
        
        // If server-side pagination is used, we might not need client-side filtering
        // But keeping this for any additional client-side processing if needed
        return result;
    }, [activityLogs]);

    const paginatedData = useMemo(() => {
        // Server-side pagination is already handled, return the data as is
        return activityLogs;
    }, [activityLogs]);

    const totalPages = useMemo(() => {
        if (auditLogsData?.data?.pagination?.totalPages) {
            return auditLogsData.data.pagination.totalPages;
        }
        return Math.ceil(sortedAndFilteredData.length / itemsPerPage);
    }, [auditLogsData, sortedAndFilteredData.length, itemsPerPage]);

    const totalItems = useMemo(() => {
        if (auditLogsData?.data?.pagination?.totalLogs) {
            return auditLogsData.data.pagination.totalLogs;
        }
        return sortedAndFilteredData.length;
    }, [auditLogsData, sortedAndFilteredData.length]);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(paginatedData.map((row) => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleRowSelect = (id, checked) => {
        if (checked) {
            setSelectedRows([...selectedRows, id]);
        } else {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        }
    };

  return (
    <BatchTranslationLoader>
        <Box component="main" className="!h-[83vh] !overflow-auto">
            <Paper radius="lg" sx={{ padding: '24px', margin: '24px' }}>
                <Container size="xl" px={0} sx={{ width: '100%', maxWidth: '100%' }}>
                    <Box className="!p-3">
                        <div className='text-2xl'>
                            {activeTab === 'activity-logs' ? tc('activityLogs') : tc('automaticBackups')}
                        </div>
                        <Text c="gray.6" size="md" mt={2}>
                            {tc('monitorCriticalSystemActionsAndManageAutomatedDataBackups')}
                        </Text>
                    </Box>

                    <Tabs
                        value={activeTab}
                        onChange={setActiveTab}
                        variant="pills"
                        color="#323232"
                        styles={
                            {
                                list: {
                                    backgroundColor: '#F8F8F8',
                                    borderRadius: '10px',
                                    border: '1px solid #E0E0E0',
                                    color: '#7C7C7C',
                                }
                            }
                        }
                        classNames={{
                            list: 'bg-gray-100 p-1 w-max rounded-lg my-6 ml-3',
                            tab: 'text-gray-500 font-medium px-6 py-2 h-auto rounded-md data-[active]:bg-gray-800 data-[active]:text-white',
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="activity-logs">{tc('activityLogs')}</Tabs.Tab>
                            <Tabs.Tab value="automatic-backups">{tc('automaticBackups')}</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="activity-logs" className="mt-0">
                        <Flex
                            justify="space-between"
                            align={{ base: 'stretch', md: 'center' }}
                            className="!p-3 !mt-3"
                            direction={{ base: 'column', md: 'row' }}
                        >
                            <TextInput
                                placeholder={tc('searchByIdAction')}
                                leftSection={<Search size={16} className='text-gray-500'/>}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                w={{ md: 350 }}
                                mb={{ base: 'md', md: 0 }}
                                styles={{ input: { height: '48px', borderRadius: '8px' } }}
                            />
                            <Group>
                                <Menu position="bottom-end" shadow="md">
                                    <Menu.Target>
                                        <Button
                                            variant="default"
                                            h={50}
                                            w={130}
                                            radius="md"
                                            rightSection={<ChevronDown size={16} />}
                                        >
                                            <SortIcon style={{ marginRight: "8px" }} /> {tc('sortBy')}
                                        </Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item onClick={() => handleSort("date")}>{tc('date')}</Menu.Item>
                                        <Menu.Item onClick={() => handleSort("user")}>{tc('user')}</Menu.Item>
                                        <Menu.Item onClick={() => handleSort("action")}>{tc('action')}</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>

                                <Popover width={345} position="bottom-end" shadow="md" withArrow>
                                    <Popover.Target>
                                        <Button 
                                            h={50} 
                                            w={150} 
                                            radius="md" 
                                            className="!bg-gray-800 hover:!bg-gray-900" 
                                        >
                                            <FaCalendarAlt style={{ marginRight: "8px" }} /> {tc('filterByDate')}
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        <Text size="sm" fw={500}>{tc('dateRange')}</Text>
                                        <Flex gap="md" mt="xs">
                                            <TextInput
                                                type="date"
                                                value={dateRange[0] || ''}
                                                onChange={(e) => handleDateRangeChange(0, e.target.value)}
                                                placeholder={tc('startDate')}
                                            />
                                            <TextInput
                                                type="date"
                                                value={dateRange[1] || ''}
                                                onChange={(e) => handleDateRangeChange(1, e.target.value)}
                                                placeholder={tc('endDate')}
                                            />
                                        </Flex>
                                        <Button mt="md" fullWidth onClick={resetDateRange} className='!bg-gray-800 hover:!bg-gray-900'>
                                            {tc('reset')}
                                        </Button>
                                    </Popover.Dropdown>
                                </Popover>
                            </Group>
                        </Flex>
                            <Box style={{ overflowX: 'auto', position: 'relative' }}>
                                {auditLogsLoading ? (
                                    <Box>
                                        {/* Table Header Skeleton */}
                                        <Flex 
                                            style={{ 
                                                backgroundColor: '#323334', 
                                                padding: '16px',
                                                borderRadius: '8px 8px 0 0'
                                            }}
                                        >
                                            <Skeleton height={20} width={80} style={{ marginRight: '16px' }} />
                                            <Skeleton height={20} width={100} style={{ marginRight: '16px' }} />
                                            <Skeleton height={20} width={200} style={{ marginRight: '16px' }} />
                                            <Skeleton height={20} width={380} />
                                        </Flex>
                                        {/* Table Rows Skeleton */}
                                        {Array.from({ length: itemsPerPage }).map((_, index) => (
                                            <Flex 
                                                key={index}
                                                style={{ 
                                                    padding: '16px',
                                                    borderBottom: '1px solid #F2F2F2',
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                <Skeleton height={16} width={80} style={{ marginRight: '16px' }} />
                                                <Skeleton height={16} width={100} style={{ marginRight: '16px' }} />
                                                <Skeleton height={16} width={200} style={{ marginRight: '16px' }} />
                                                <Flex justify="space-between" align="center" style={{ width: '380px' }}>
                                                    <Skeleton height={16} width={250} />
                                                    <Skeleton height={32} width={80} radius="md" />
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </Box>
                                ) : (
                                    <SecurityTable
                                        data={paginatedData}
                                        sortConfig={sortConfig}
                                        onSort={handleSort}
                                        selectedRows={selectedRows}
                                        onSelectAll={handleSelectAll}
                                        onRowSelect={handleRowSelect}
                                        handleDelete={handleDelete}
                                    />
                                )}
                            </Box>
                            <Flex justify="space-between" align="center" mt={24} direction={{ base: "column", md: "row" }} className='p-3'>
                                <Text size="md" c="#323232" mb={{ base: "md", md: 0 }}>
                                    {paginatedData.length > 0
                                        ? `${(activePage - 1) * itemsPerPage + 1}-${String(Math.min(activePage * itemsPerPage, totalItems)).padStart(2, "0")} ${tc('of')} ${totalItems} ${tc('items')}`
                                        : `0 ${tc('items')}`}
                                </Text>
                                <Pagination
                                    total={totalPages}
                                    page={activePage}
                                    onChange={setPage}
                                    withEdges
                                    styles={(theme) => ({
                                        control: {
                                            width: '28px', height: '28px', minWidth: '28px', borderRadius: '6px', border: '1px solid #EAEAEA', backgroundColor: 'white', color: '#323232', fontWeight: 400,
                                            '&:hover': {
                                                backgroundColor: theme.colors.gray[1],
                                            },
                                            '&[data-active]': {
                                                backgroundColor: '#738B4A',
                                                border: '1px solid #738B4A',
                                                color: 'white',
                                                fontWeight: 700,
                                            },
                                            '&[data-first], &[data-last], &[data-next], &[data-previous]': {
                                                backgroundColor: '#738B4A',
                                                border: '1px solid #738B4A',
                                                color: 'white',
                                                '&:not([data-disabled]):hover': {
                                                    backgroundColor: '#6A8838'
                                                },
                                                '&[data-disabled]': {
                                                    cursor: 'not-allowed',
                                                    backgroundColor: theme.colors.gray[4],
                                                }
                                            },
                                        },
                                    })}
                                />
                                <Group>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onChange={(value) => { setItemsPerPage(Number(value)); setPage(1); }}
                                    data={[{ value: "5", label: "05" }, { value: "10", label: "10" }]}
                                    rightSection={<IoIosArrowDown size={14} />}
                                    styles={{
                                        root: { width: "70px" },
                                        input: { backgroundColor: "#738B4A", color: "white", fontWeight: 500, height: "28px", minHeight: "28px", borderRadius: "6px", border: "1px solid #738B4A", textAlign: "center", padding: "0 10px", '&:hover': { backgroundColor: '#6A8838' } },
                                        rightSection: { color: 'white' },
                                        item: {
                                            '&[data-selected]': {
                                                '&, &:hover': {
                                                    backgroundColor: '#738B4A',
                                                    color: 'white'
                                                }
                                            }
                                        },
                                    }}
                                />
                                <Text size="md" c="#323232">{tc('itemsPerPage')}</Text>
                                </Group>
                            </Flex>
                        </Tabs.Panel>
                        
                        <Tabs.Panel value="automatic-backups" className="mt-6 h-[60vh] p-4">
                            <Flex
                                justify="space-between"
                                align={{ base: 'stretch', md: 'flex-start' }}
                                direction={{ base: 'column', md: 'row' }}
                                gap="lg"
                            >
                                <Box>
                                    <Text fw={500} className='mb-2'>{tc('backupFrequency')}</Text>
                                    <Select 
                                        data={[tc('daily'), tc('weekly'), tc('monthly')]} 
                                        value={backupFrequency}
                                        onChange={setBackupFrequency}
                                        radius="md" 
                                        rightSection={<ChevronDown size={16} />}
                                        w={250}
                                        styles={{
                                            input: {
                                                backgroundColor: '#F8F8F8',
                                                border: '1px solid #E0E0E0'
                                            }
                                        }}
                                    />
                                </Box>

                                <Flex
                                    direction="column"
                                    align={{ base: 'stretch', md: 'flex-end' }}
                                    gap="lg"
                                    mt={{ base: 'md', md: 0 }}
                                >
                                    <Box className='bg-blue-100 border border-blue-200 text-blue-800 py-3 px-6 rounded-lg text-center'>
                                        <Text size='sm'>{tc('lastBackup')}:</Text>
                                        {backupsLoading ? (
                                            <Text>{tc('loading')}</Text>
                                        ) : lastBackup ? (
                                            <Text fw={700}>{new Date(lastBackup.createdAt).toLocaleString()}</Text>
                                        ) : (
                                            <Text fw={700}>{tc('noBackupsFound')}</Text>
                                        )}
                                    </Box>

                                    <Group>
                                        <Button variant='default' size='md' radius='md' onClick={handleManualBackup} loading={createManualBackupMutation.isLoading}>{tc('runManualBackup')}</Button>
                                        <Button 
                                            className="!bg-gray-800 hover:!bg-gray-900" 
                                            size='md' 
                                            radius='md' 
                                            onClick={handleRestoreBackup}
                                            disabled={!lastBackup || restoreBackupMutation.isLoading}
                                        >
                                            {restoreBackupMutation.isLoading ? tc('restoring') : tc('restoreFromLastBackup')}
                                        </Button>
                                    </Group>
                                </Flex>
                            </Flex>
                        </Tabs.Panel>
                    </Tabs>
                </Container>
            </Paper>

            <CommonModal
                opened={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                title={tc('confirmRestore')}
                content={
                    <div>
                        <Text>{tc('areYouSureRestoreFromLastBackup')}</Text>
                        <Group mt="md" justify="flex-end">
                            <Button variant="default" onClick={() => setRestoreModalOpen(false)}>
                                {tc('cancel')}
                            </Button>
                            <Button
                                color="red"
                                onClick={confirmRestore}
                                loading={restoreBackupMutation.isLoading || safeRestoreBackupMutation.isLoading}
                            >
                                {restoreBackupMutation.isLoading || safeRestoreBackupMutation.isLoading ? tc('restoring') : tc('restore')}
                            </Button>
                        </Group>
                    </div>
                }
            />

            {/* Progress Loader Modal */}
            <CommonModal
                opened={progressModalOpen}
                onClose={() => {
                    if (progressIntervalId) clearInterval(progressIntervalId);
                    setProgressIntervalId(null);
                    setProgressModalOpen(false);
                    setProgressPercent(0);
                    setProgressPhase('');
                    setProgressNonDismissable(false);
                }}
                title={`${progressTitle} ${progressPhase ? `- ${progressPhase}` : ''}`}
                closeOnClickOutside={!progressNonDismissable}
                content={
                    <div>
                        <Box
                            style={{
                                width: '100%',
                                height: 12,
                                backgroundColor: '#e5e7eb',
                                borderRadius: 6,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                style={{
                                    width: `${progressPercent}%`,
                                    height: 12,
                                    backgroundColor: '#1f2937',
                                    transition: 'width 0.6s ease',
                                }}
                            />
                        </Box>
                        <Text mt="sm" fw={700}>{Math.round(progressPercent)}%</Text>
                        <Text c="gray.6" size="sm">{progressPhase || (progressOperation === 'backup' ? tc('runManualBackup') : tc('restoring'))}</Text>
                    </div>
                }
            />
        </Box>
    </BatchTranslationLoader>
    );
};

export default Security;