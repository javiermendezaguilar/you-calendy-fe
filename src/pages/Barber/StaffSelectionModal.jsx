import React, { useState, useEffect, useMemo } from 'react';
import { Button, Skeleton } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

// Helper function to extract service identifier
const toServiceIdentifier = (serviceLike) => {
  if (!serviceLike) return undefined;
  if (typeof serviceLike === 'string') return serviceLike;
  if (typeof serviceLike === 'object') {
    return (
      serviceLike._id ||
      serviceLike.id ||
      (typeof serviceLike.service === 'string' ? serviceLike.service : toServiceIdentifier(serviceLike.service))
    );
  }
  return undefined;
};

// Helper function to parse minutes from various formats
const parseMinutes = (value) => {
  if (value === undefined || value === null) return undefined;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.round(numeric);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

// Helper function to format minutes into a readable label
const formatMinutesLabel = (minutes) => {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) {
    return undefined;
  }
  const wholeMinutes = Math.round(minutes);
  const hours = Math.floor(wholeMinutes / 60);
  const remaining = wholeMinutes % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (remaining > 0) parts.push(`${remaining} min`);
  if (parts.length === 0) parts.push('1 min');
  return parts.join(' ').trim();
};

// Helper function to get service duration for a specific staff member
const getStaffServiceDuration = (staffMember, serviceId) => {
  if (!staffMember || !serviceId || !Array.isArray(staffMember.services)) {
    return undefined;
  }
  
  const serviceEntry = staffMember.services.find((entry) => {
    const entryServiceId = toServiceIdentifier(entry?.service ?? entry);
    return entryServiceId && String(entryServiceId) === String(serviceId);
  });
  
  if (!serviceEntry) {
    return undefined;
  }
  
  const minutes = parseMinutes(serviceEntry?.timeInterval ?? serviceEntry?.duration ?? serviceEntry?.minutes);
  return minutes ? formatMinutesLabel(minutes) : undefined;
};

const StaffSelectionModal = ({ show, onClose, onStaffSelected, service }) => {
  const { tc } = useBatchTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        
        // Get staff data from public barber data
        const publicBarberData = localStorage.getItem('publicBarberData');
        
        if (publicBarberData) {
          const barberData = JSON.parse(publicBarberData);
          setStaff(barberData.staff || []);
        } else {
          toast.error(tc('businessInformationMissing'));
        }
      } catch (error) {
        toast.error(tc('errorLoadingStaff'));
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchStaff();
    }
  }, [show]);

  // Filter staff to only show those who have the selected service
  const filteredStaff = useMemo(() => {
    if (!service) {
      // If no service is provided, show all staff
      return staff;
    }

    const serviceId = toServiceIdentifier(service);
    if (!serviceId) {
      // If service ID cannot be determined, show all staff
      return staff;
    }

    // Filter staff to only include those who have this service assigned
    return staff.filter((staffMember) => {
      const staffServices = Array.isArray(staffMember?.services) ? staffMember.services : [];
      return staffServices.some((entry) => {
        const entryServiceId = toServiceIdentifier(entry?.service ?? entry);
        return entryServiceId && String(entryServiceId) === String(serviceId);
      });
    });
  }, [staff, service]);

  // Reset selected staff when modal opens or filtered list changes
  useEffect(() => {
    if (show) {
      setSelectedStaff(null);
    }
  }, [show, filteredStaff]);

  // Clear selected staff if it's no longer in the filtered list
  useEffect(() => {
    if (selectedStaff && filteredStaff.length > 0) {
      const isStillInList = filteredStaff.some(
        (staffMember) => staffMember._id === selectedStaff._id
      );
      if (!isStillInList) {
        setSelectedStaff(null);
      }
    }
  }, [filteredStaff, selectedStaff]);

  const handleStaffSelect = (staffMember) => {
    setSelectedStaff(staffMember);
  };

  const handleContinue = () => {
    if (!selectedStaff) {
      toast.error(tc('pleaseSelectStaff'));
      return;
    }

    // Pass selected staff information to next modal (don't save to localStorage)
    toast.success(tc('staffSelectedSuccessfully'));
    onStaffSelected(selectedStaff);
  };

  const modalContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {tc('selectStaff')}
        </h2>
        <p className="text-gray-600 text-sm">
          {tc('chooseYourPreferredStaffMember')}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton height={20} width="60%" mb="sm" />
              <Skeleton height={16} width="40%" />
            </div>
          ))}
        </div>
      ) : filteredStaff.length > 0 ? (
        <div className="space-y-3">
          {filteredStaff.map((staffMember) => (
            <div
              key={staffMember._id}
              onClick={() => handleStaffSelect(staffMember)}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                selectedStaff?._id === staffMember._id
                  ? 'border-[#556b2f] bg-[#556b2f]/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {staffMember.firstName} {staffMember.lastName}
                </h3>
                {staffMember.specialties && staffMember.specialties.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {tc('specialties')} {staffMember.specialties.join(', ')}
                  </p>
                )}
                {staffMember.experience && (
                  <p className="text-sm text-gray-500">
                    {tc('experience')} {staffMember.experience}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {service && (() => {
                  const serviceId = toServiceIdentifier(service);
                  const duration = serviceId ? getStaffServiceDuration(staffMember, serviceId) : undefined;
                  return duration ? (
                    <span className="font-light text-[#848d9b] text-sm whitespace-nowrap">
                      Service time: {duration}
                    </span>
                  ) : null;
                })()}
                {selectedStaff?._id === staffMember._id && (
                  <div className="text-[#556b2f]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {service 
              ? (tc('noStaffMembersWithThisService') || 'No staff members are assigned to this service.')
              : (tc('noStaffMembersAvailable') || 'No staff members available')}
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Button
          onClick={onClose}
          variant="outline"
          color="gray"
          fullWidth
          disabled={loading}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={handleContinue}
          color="dark"
          fullWidth
          disabled={loading || !selectedStaff}
        >
{tc('continue')}
        </Button>
      </div>
    </div>
  );

  return (
    <CommonModal
      opened={show}
      onClose={onClose}
      content={modalContent}
      size="md"
      styles={{
        content: {
          maxWidth: "600px",
        },
        body: {
          minHeight: "500px",
        }
      }}
    />
  );
};

export default StaffSelectionModal;
