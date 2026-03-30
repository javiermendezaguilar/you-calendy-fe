import React from 'react';
import { Button, Radio, Textarea, Select, NumberInput, Text, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import moment from 'moment';
import { useBatchTranslation } from '../../../contexts/BatchTranslationContext';

const NoShowPenalty = ({ close, onSubmit, clientName, incidentNotes = [], serviceName = 'Service', registrationStatus = 'unregistered' }) => {
  const { tc } = useBatchTranslation();
  const isRegistered = registrationStatus === 'registered';
  const form = useForm({
    initialValues: {
      blockClient: false,
      incidentNote: '',
      // Keeping these for backward compatibility or if needed later, but they won't be visible for Walk-ins
      penaltyType: 'money',
      penaltyAmount: 0,
      comment: '',
    },
  });

  const handleSubmit = () => {
    // Only send relevant fields based on requirements
    const penaltyData = {
      incidentNote: form.values.incidentNote,
      blockClient: form.values.blockClient,
      status: 'No-Show'
    };

    onSubmit(penaltyData);
  };

  // Walk-in Client View
  if (!isRegistered) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-start mb-1 font-['Outfit',Helvetica]">
          {tc('noShowFor').replace('{clientName}', clientName || tc('client'))}
        </h2>
        <Text size="sm" color="dimmed" mb={8} className="font-semibold text-gray-600">
          {(serviceName && serviceName !== 'Service') ? serviceName : tc('appointmentService')}
        </Text>

        {/* Client Incident History */}
        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <Text weight={700} size="sm" color="red.7">{tc('clientIncidentHistory')}</Text>
            <Badge color="red" variant="filled">
              {incidentNotes.filter(n => n.type === 'no-show').length} {tc('noShows')}
            </Badge>
          </div>
          {incidentNotes.length > 0 ? (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {[...incidentNotes].reverse().map((incident, idx) => (
                <div key={idx} className="text-xs bg-white p-3 rounded-lg border border-red-50 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <div className="flex flex-col">
                      <Text size="xs" weight={700}>{moment(incident.date).format('MMM D, YYYY')}</Text>
                      {/* <Text size="xs" color="dimmed" weight={500}>
                        {incident.serviceName || tc('serviceNotRecorded')}
                      </Text> */}
                    </div>
                    <Badge size="xs" variant="outline" color="red">{tc('noShow')}</Badge>
                  </div>
                  <Text size="xs" color="gray.7">{incident.note || tc('noDetails')}</Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="xs" color="dimmed" italic>{tc('noIncidentHistoryFound')}</Text>
          )}
        </div>

        {/* Incident Note (Permanent Free-Text) */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Outfit',Helvetica]">
            {tc('incidentNotes')}
          </label>
          <Textarea
            placeholder={tc('addIncidentNotePlaceholder')}
            minRows={5}
            className="w-full"
            styles={{
              input: {
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '12px',
                fontSize: '14px',
                height: '120px'
              }
            }}
            {...form.getInputProps('incidentNote')}
          />
          <Text size="xs" color="dimmed" mt={2}>
            {tc('incidentNoteWillBePermanentlyAssociated')}
          </Text>
        </div>

        <div className="flex gap-3">
          <Button
            variant="subtle"
            onClick={close}
            color="gray"
            size="md"
            className='flex-1 rounded-lg'
          >
            {tc('cancel')}
          </Button>
          <Button
            color="dark"
            onClick={handleSubmit}
            size="md"
            className='flex-1 rounded-lg !bg-black'
          >
            {tc('confirm')}
          </Button>
        </div>
      </div>
    );
  }

  // Registered App Client View (Confirmation Dialog)
  return (
    <div className="p-6 max-w-sm mx-auto text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E03131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4 font-['Outfit',Helvetica]">
        {tc('noShowConfirmation')}
      </h3>
      
      <div className="text-sm text-gray-700 mb-6 leading-relaxed text-center space-y-3">
        <p>
          {tc('blockExplanationPart1')}
        </p>
        <p className="font-medium text-gray-600">
          {tc('blockExplanationPart2')}
        </p>
        <p className="font-semibold text-gray-900 pt-2">
          {tc('blockClientFutureAppointmentsQuestion')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          color="red"
          size="md"
          fullWidth
          className="rounded-lg !bg-red-600 hover:!bg-red-700"
          onClick={() => {
            form.setFieldValue('blockClient', true);
            // Handle as async to ensure state update if needed, though handleSubmit uses form.values
            const penaltyData = {
              incidentNote: form.values.incidentNote,
              blockClient: true,
              status: 'No-Show'
            };
            onSubmit(penaltyData);
          }}
        >
          {tc('yesBlockClient')}
        </Button>
        
        <Button
          variant="outline"
          color="dark"
          size="md"
          fullWidth
          className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => {
            form.setFieldValue('blockClient', false);
            const penaltyData = {
              incidentNote: form.values.incidentNote,
              blockClient: false,
              status: 'No-Show'
            };
            onSubmit(penaltyData);
          }}
        >
          {tc('noJustRecord')}
        </Button>

        <Button
          variant="subtle"
          color="gray"
          size="sm"
          className="mt-2"
          onClick={close}
        >
          {tc('cancel')}
        </Button>
      </div>
    </div>
  );
};

export default NoShowPenalty;