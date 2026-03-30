import React, { useState } from 'react';
import { Button, Tabs, Text, Textarea, Select, Card, Group, Divider } from '@mantine/core';
import { ChevronDown } from 'tabler-icons-react';
import {
  useAllTickets,
  useUpdateTicketPriority,
  useUpdateTicketStatus,
  useSendMassNotification,
  useAddSupportReply,
} from '../../hooks/useSupport';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';

const TechnicalSupportTicket = ({
  _id,
  title,
  issueDescription,
  priority,
  status,
  barber,
  replies,
  onPriorityChange,
  onStatusChange,
  onSendReply,
}) => {
  const { tc } = useBatchTranslation();
  const [replyMessage, setReplyMessage] = useState('');
  
  return (
    <Card shadow="sm" p="xl" radius="lg" withBorder className="mb-6 bg-white">
      <div className="flex flex-wrap justify-between items-start gap-x-8 gap-y-4">
        <div className="flex gap-12 flex-grow" style={{ flexBasis: '50%' }}>
          <div className="flex-1">
            <Text size="sm" c="#323232" fw={500}>{tc('barber')}</Text>
            <Text size="sm" fw={300} className="text-blue-600">{barber?.name || tc('na')}</Text>
            <Text size="xs" fw={300} className="text-gray-500">{barber?.email || tc('na')}</Text>
          </div>
          <div className="flex-1">
            <Text size="sm" c="#323232" fw={500}>{tc('issue')}</Text>
            <Text size="sm" fw={300}>{title}</Text>
            <Text size="xs" fw={300} className="mt-1 text-gray-600">{issueDescription}</Text>
            {replies && replies.length > 0 && (
              <div className="mt-3 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                <Text size="sm" fw={500} className="text-blue-700">{tc('adminReply') || 'Admin Reply'}</Text>
                <Text size="sm" className="mt-1">{replies[0]?.message}</Text>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8 flex-grow items-end" style={{ flexBasis: '30%' }}>
          <div className="flex-1">
            <Text size="sm" c="#323232" fw={500}>{tc('priority')}</Text>
            <Select 
              data={[
                { value: 'Low', label: tc('low') },
                { value: 'Medium', label: tc('medium') },
                { value: 'High', label: tc('high') },
                { value: 'Critical', label: tc('critical') }
              ]} 
              defaultValue={priority} 
              placeholder={tc('selectPriority') || 'Select priority'}
              onChange={(value) => onPriorityChange(_id, value)}
              radius="md" 
              rightSection={<ChevronDown size={16} color='#7898AB' />} 
              styles={{
                input: { backgroundColor: '#F8F8F8' }
              }}
            />
          </div>
          <div className="flex-1">
            <Text size="sm" c="#323232" fw={500}>{tc('status')}</Text>
            <Select 
              data={[
                { value: 'pending', label: tc('pending') },
                { value: 'resolved', label: tc('resolved') },
                { value: 'completed', label: tc('completed') }
              ]} 
              defaultValue={status} 
              placeholder={tc('selectStatus') || 'Select status'}
              onChange={(value) => onStatusChange(_id, value)}
              radius="md" 
              rightSection={<ChevronDown size={16} color='#7898AB'  />} 
              styles={{
                input: { backgroundColor: '#F8F8F8' }
              }}
            />
          </div>
        </div>
      </div>
      <Divider className="my-4" />
      <div>
        {(!replies || replies.length === 0) ? (
          <div className="space-y-3">
            <Text size="sm" c="#323232" fw={500}>{tc('replyToBarber') || 'Reply to Barber'}</Text>
            <Textarea
              placeholder={tc('enterYourReply') || 'Enter your reply'}
              minRows={3}
              radius="md"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              styles={{ input: { backgroundColor: '#F8F8F8' } }}
            />
            <Button size="sm" className="!bg-gray-800 hover:!bg-gray-900" radius="md" onClick={() => onSendReply(_id, replyMessage)} disabled={!replyMessage.trim()}>
              {tc('sendReply') || 'Send Reply'}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

const Support = () => {
  const { tc } = useBatchTranslation();
  const [activeTab, setActiveTab] = useState("mass-notifications");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState('All Users');

  const [filters, setFilters] = useState({});
  const { data: ticketData, isLoading: ticketsLoading } = useAllTickets(filters);
  const { mutate: updatePriority } = useUpdateTicketPriority();
  const { mutate: updateStatus } = useUpdateTicketStatus();
  const { mutate: sendNotification, isLoading: isSending } = useSendMassNotification();
  const { mutate: addReply } = useAddSupportReply();

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleSendReply = (id, message) => {
    addReply({ id, message });
  };

  const handleSendNotification = () => {
    let group = "all";
    if (targetAudience === tc('barbers')) {
      group = "barbers";
    } else if (targetAudience === tc('clients')) {
      group = "clients";
    }
    sendNotification({
      recipientGroup: group,
      message,
    });
  };

  return (
    <BatchTranslationLoader>
      <div className="p-5 bg-[#ffffff] rounded-lg h-[83vh] overflow-auto">
        <div className="mb-8">
          <div>
              <div className="text-2xl">
                  {tc('massNotification')}
              </div>
            <p className="text-gray-500 ">
              {tc('sendPlatformWideAlertsAndManageUserSupportTickets')}
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
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
              list: 'bg-white p-1 w-max rounded-lg mb-6 border border-gray-200',
              tab: 'text-gray-500 font-medium px-6 py-2 h-auto rounded-md data-[active]:bg-gray-800 data-[active]:text-white',
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="mass-notifications">
              {tc('massNotifications')}
            </Tabs.Tab>
            <Tabs.Tab value="technical-support">
              {tc('technicalSupport')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="mass-notifications" className="mt-6">
              <div className='max-w-xl space-y-6'>
                  <div>
                      <Text fw={500} className='!text-[#7898AB] !mb-2'>{tc('message')}</Text>
                      <Textarea
                          placeholder={tc('enterYourMessageNotification')}
                          minRows={8}
                          radius="md"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          styles={{
                              input: {
                                  backgroundColor: '#F8F8F8',
                                  minHeight: '110px'
                              }
                          }}
                      />
                  </div>
                  <div>
                      <Text fw={500} className='!text-[#7898AB] !mb-2'>{tc('targetAudience')}</Text>
                      <Select
                          rightSection={<ChevronDown size={16} />}
                          data={[tc('allUsers'), tc('barbers'), tc('clients')]}
                          value={targetAudience}
                          onChange={setTargetAudience}
                          radius="md"
                          styles={{
                              input: {
                                  backgroundColor: '#F8F8F8'
                              }
                          }}
                      />
                  </div>
                  <div className='pt-2'>
                      <Button size="md" className="!bg-gray-800 hover:!bg-gray-900" radius="md" onClick={handleSendNotification} loading={isSending}>
                          {tc('sendNotification')}
                      </Button>
                  </div>
              </div>
          </Tabs.Panel>
          <Tabs.Panel value="technical-support" className="pt-4">
              {/* Filters for tickets */}
              <div className="mb-4 flex flex-wrap gap-4 items-end">
                <div className="w-48">
                  <Text fw={500} className='!text-[#7898AB] !mb-2'>{tc('priority')}</Text>
                  <Select 
                    data={[
                      { value: 'Low', label: tc('low') },
                      { value: 'Medium', label: tc('medium') },
                      { value: 'High', label: tc('high') },
                      { value: 'Critical', label: tc('critical') },
                    ]}
                    value={filters.priority || null}
                    onChange={(value) => setFilters(prev => ({ ...prev, priority: value || undefined }))}
                    clearable
                    placeholder={tc('selectPriority') || 'Select priority'}
                    radius="md"
                  />
                </div>
                <div className="w-48">
                  <Text fw={500} className='!text-[#7898AB] !mb-2'>{tc('status')}</Text>
                  <Select 
                    data={[
                      { value: 'pending', label: tc('pending') },
                      { value: 'resolved', label: tc('resolved') },
                      { value: 'completed', label: tc('completed') },
                    ]}
                    value={filters.status || null}
                    onChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                    clearable
                    placeholder={tc('selectStatus') || 'Select status'}
                    radius="md"
                  />
                </div>
                <Group>
                  <Button variant="default" onClick={() => setFilters({})}>{tc('clear') || 'Clear'}</Button>
                </Group>
              </div>
              {ticketsLoading ? (
                <Text>{tc('loadingTickets')}</Text>
              ) : ticketData && ticketData.supportTickets && ticketData.supportTickets.length > 0 ? (
                ticketData.supportTickets.map((ticket) => (
                  <TechnicalSupportTicket
                    key={ticket._id}
                    {...ticket}
                    onPriorityChange={(id, priority) => updatePriority({ id, priority })}
                    onStatusChange={(id, status) => updateStatus({ id, status })}
                    onSendReply={handleSendReply}
                  />
                ))
              ) : (
                <div className='text-center py-8'>
                  <Text c="dimmed">{tc('noTechnicalSupportTicketsFound')}</Text>
                </div>
              )}
          </Tabs.Panel>
        </Tabs>
      </div>
    </BatchTranslationLoader>
  );
};

export default Support;
