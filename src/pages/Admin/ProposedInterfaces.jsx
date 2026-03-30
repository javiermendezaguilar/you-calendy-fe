import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaGem, FaCalendarCheck, FaHandHoldingUsd, FaCheck } from 'react-icons/fa';
import { TotalBarbersIcon, AppointmentIcon, RevenueIcon, SubAdminIcon, TrashIcon  } from '../../components/common/Svgs';  
import { ChevronDown } from 'tabler-icons-react';
import { useAdminUserStats, useAdminRevenueProjection, useAdminSubadmins, useCreateSubadmin, useDeleteSubadmin } from '../../hooks/useAdmin';
import { Skeleton, Button, Box, Paper, Container, Text, Stack } from '@mantine/core';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';

const StatCardSkeleton = () => (
    <div className="p-4 rounded-xl border border-gray-200 flex items-center justify-between bg-white">
        <div>
            <Skeleton height={12} width={150} mb="sm" />
            <Skeleton height={30} width={100} />
        </div>
        <Skeleton height={50} circle />
    </div>
);

const SubAdminRowSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-lg border border-gray-200">
        <div className="col-span-1 md:col-span-3"><Skeleton height={40} /></div>
        <div className="col-span-1 md:col-span-3"><Skeleton height={40} /></div>
        <div className="col-span-1 md:col-span-2"><Skeleton height={40} /></div>
        <div className="col-span-1 md:col-span-2"><Skeleton height={40} /></div>
        <div className="col-span-1 flex items-end gap-2"><Skeleton height={40} width={40} /></div>
    </div>
);

const ProposedInterfacesSkeleton = () => {
    return (
        <Box component="main" className="!h-[83vh] !overflow-auto">
            <Stack gap="md">
                {/* Administrator Overview Skeleton */}
                <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
                    <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
                        <Box className="!p-3">
                            <Skeleton height={28} width={250} />
                            <Skeleton height={20} width={400} mt="sm" />
                        </Box>
                        <div className="!p-3 !mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                    </Container>
                </Paper>

                {/* Create Sub-Administrator Skeleton */}
                <Paper radius="lg" sx={{ padding: "24px", margin: "0 24px 24px 24px", marginTop: "24px" }}>
                    <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
                        <Box className="!p-3">
                            <Skeleton height={24} width={300} mb="xl" />
                            <div className="space-y-4">
                                <SubAdminRowSkeleton />
                                <SubAdminRowSkeleton />
                            </div>
                        </Box>
                    </Container>
                </Paper>
            </Stack>
        </Box>
    );
};

const ProposedInterfaces = () => {
    const { tc } = useBatchTranslation();
    // API Hooks
    const { data: userStats, isLoading: isUserStatsLoading } = useAdminUserStats();
    const { data: revenueData, isLoading: isRevenueLoading } = useAdminRevenueProjection({ groupBy: 'month' });
    const { data: subAdminsData, isLoading: isSubAdminsLoading, refetch } = useAdminSubadmins();
    const createSubadminMutation = useCreateSubadmin();
    const deleteSubadminMutation = useDeleteSubadmin();

    // Local state for managing sub-admin forms
    const [subAdmins, setSubAdmins] = useState([]);

    useEffect(() => {
        if (subAdminsData?.data?.subadmins) {
            setSubAdmins(subAdminsData.data.subadmins.map(admin => ({ ...admin, isNew: false })));
        }
    }, [subAdminsData]);

    const handleAddSubAdmin = () => {
        const newId = `new-${Date.now()}`;
        setSubAdmins([...subAdmins, { id: newId, name: '', email: '', password: '', role: 'Support Only', isNew: true }]);
    };
    
    const handleRemoveSubAdmin = (id) => {
        if (String(id).startsWith('new-')) {
            setSubAdmins(subAdmins.filter(admin => admin.id !== id));
        } else {
            deleteSubadminMutation.mutate(id);
        }
    };
    
    const handleInputChange = (id, field, value) => {
        setSubAdmins(subAdmins.map(admin => admin.id === id ? { ...admin, [field]: value } : admin));
    };

    const handleSaveSubAdmin = (adminData) => {
        if (!adminData.name || !adminData.email || !adminData.password) {
            return toast.error(tc('nameEmailAndPasswordAreRequired'));
        }
        
        createSubadminMutation.mutate({
            name: adminData.name,
            email: adminData.email,
            password: adminData.password,
            permissions: adminData.role.toLowerCase()
        });
    };

    const isLoading = isUserStatsLoading || isRevenueLoading || isSubAdminsLoading;

    if (isLoading) {
        return <ProposedInterfacesSkeleton />;
    }

    return (
        <BatchTranslationLoader>
            <Box component="main" className="!h-[83vh] !overflow-auto">
                <Stack gap="md">
                    {/* Administrator Overview */}
                    <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
                        <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
                            <Box className="!p-3">
                                <div className="text-2xl">
                                    {tc('administratorOverview')}
                                </div>
                                <Text c="rgba(147,151,153,1)" size="md" mt={2}>
                                    {tc('centralHubForViewingPlatformMetricsAndManagingSubAdminRoles')}
                                </Text>
                            </Box>
                            
                            <div className="!p-3 !mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                <StatCard icon={<TotalBarbersIcon />} title={tc('totalBarbers')} value={userStats?.data?.barbers?.total ?? 0} />
                                <StatCard icon={<AppointmentIcon />} title={tc('appointmentsThisMonth')} value={revenueData?.data?.totalAppointments ?? 0} />
                                <StatCard icon={<RevenueIcon />} title={tc('revenueThisMonth')} value={`$${(revenueData?.data?.totalRevenue ?? 0).toLocaleString()}`} />
                            </div>
                        </Container>
                    </Paper>

                    {/* Manage Sub-Administrators */}
                    <Paper radius="lg" sx={{ padding: "24px", margin: "0 24px 24px 24px", marginTop: "24px" }}>
                        <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
                            <Box className="!p-3">
                                <h2 className="text-xl flex items-center gap-3 mb-6">
                                    <SubAdminIcon />
                                    {tc('manageSubAdministrators')}
                                </h2>

                                <div className="mt-6 space-y-4">
                                    
                                    {subAdmins.map((admin, index) => (
                                        <div key={admin.id || admin._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-lg border border-gray-200">
                                            <div className="col-span-1 md:col-span-3">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">{tc('name')}</label>
                                                <input
                                                    type="text" placeholder={tc('johnDoe')} value={admin.name}
                                                    onChange={(e) => handleInputChange(admin.id || admin._id, 'name', e.target.value)}
                                                    className="mt-1 w-full p-2.5 border-none rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                                    disabled={!admin.isNew}
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-3">
                                                 <label className="text-xs font-semibold text-gray-500 uppercase">{tc('email')}</label>
                                                <input
                                                    type="email" placeholder={tc('johnExampleCom')} value={admin.email}
                                                    onChange={(e) => handleInputChange(admin.id || admin._id, 'email', e.target.value)}
                                                    className="mt-1 w-full p-2.5 border-none rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                                    disabled={!admin.isNew}
                                                />
                                            </div>
                                            {admin.isNew && (
                                            <div className="col-span-1 md:col-span-2">
                                                 <label className="text-xs font-semibold text-gray-500 uppercase">{tc('password')}</label>
                                                <input
                                                    type="password" placeholder={tc('passwordPlaceholder')} value={admin.password}
                                                    onChange={(e) => handleInputChange(admin.id, 'password', e.target.value)}
                                                    className="mt-1 w-full p-2.5 border-none rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                                />
                                            </div>
                                            )}
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">{tc('role')}</label>
                                                <div className="relative">
                                                    <select
                                                        value={admin.role}
                                                        onChange={(e) => handleInputChange(admin.id || admin._id, 'role', e.target.value)}
                                                        className="mt-1 w-full p-2.5 border-none rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                                                        disabled={!admin.isNew}
                                                    >
                                                        <option>{tc('supportOnly')}</option>
                                                        <option>{tc('completeAccess')}</option>
                                                        <option>{tc('managementAccess')}</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-1 flex items-end gap-2">
                                                {admin.isNew && (
                                                    <button 
                                                        onClick={() => handleSaveSubAdmin(admin)} 
                                                        className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                        disabled={createSubadminMutation.isLoading}
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveSubAdmin(admin.id || admin._id)}
                                                    className="p-3 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    disabled={deleteSubadminMutation.isLoading}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleAddSubAdmin}
                                    className="mt-4 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                                >
                                    {tc('addSubAdmin')}
                                </button>
                            </Box>
                        </Container>
                    </Paper>
                </Stack>
            </Box>
        </BatchTranslationLoader>
    );
};

const StatCard = ({ icon, title, value }) => {
    return (
        <div className={`p-4 rounded-xl border border-gray-200 flex items-center justify-between bg-white`}>
            <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className={`p-4 rounded-full`}>
                <div className="text-2xl text-gray-600">{icon}</div>
            </div>
        </div>
    );
};

export default ProposedInterfaces;
