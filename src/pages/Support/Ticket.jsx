import {
  Accordion,
  Button,
  Skeleton,
  Text,
  Group,
  Divider,
} from "@mantine/core";
import React from "react";
import { Link } from "react-router-dom";
import { useMyTickets, useDeleteTicket } from "../../hooks/useSupport";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const CreateTicket = ({ hasTickets }) => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className="flex flex-wrap items-center justify-between my-4 bg-white p-4 md:p-8 rounded-xl border border-slate-300 shadow-xl">
      <div>
        <p className="text-xl text-slate-800 font-semibold">{tc('yourTicket')}</p>
        <p className="text-slate-400 text-sm">
          {hasTickets
            ? tc('createNewTicketForSupport')
            : tc('noTicketsYet')}
        </p>
      </div>
      <Link to={"/dashboard/create-ticket"}>
        <Button radius="md" size="md" className="!bg-zinc-950 !mt-4 !md:mt-0">
          {tc('createTicket')}
        </Button>
      </Link>
    </div>
  );
};

const TicketNotification = ({ count, isLoading }) => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className="flex flex-wrap items-start justify-between my-4 bg-white p-4 md:p-8 rounded-xl border border-slate-300 shadow-xl">
      <div>
        <p className="text-xl text-slate-800 font-semibold">
          {tc('yourTicketNotification')}
        </p>
        {isLoading ? (
          <Skeleton height={20} width="60%" radius="md" />
        ) : (
          <p className="text-slate-400 text-sm">
            {count > 0
              ? tc('activeTickets').replace('{count}', count).replace('{s}', count > 1 ? 's' : '')
              : tc('noActiveTickets')}
          </p>
        )}
      </div>
    </div>
  );
};

const formatDate = (dateString, currentLanguage = 'en') => {
  const date = new Date(dateString);
  const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const translateStatus = (status, tc) => {
  const statusMap = {
    'pending': tc('statusPending'),
    'resolved': tc('statusResolved'),
    'completed': tc('statusCompleted')
  };
  return statusMap[status] || status;
};

const translatePriority = (priority, tc) => {
  const priorityMap = {
    'Critical': tc('priorityCritical'),
    'High': tc('priorityHigh'),
    'Medium': tc('priorityMedium'),
    'Low': tc('priorityLow')
  };
  return priorityMap[priority] || priority;
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "orange";
    case "resolved":
      return "green";
    case "completed":
      return "blue";
    default:
      return "gray";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "yellow";
    case "Low":
      return "green";
    default:
      return "gray";
  }
};

const TicketReplies = ({ replies }) => {
  const { tc, currentLanguage } = useBatchTranslation();
  
  if (!replies || replies.length === 0) {
    return (
      <div className="mt-4 text-slate-500 italic text-sm">
        {tc('noRepliesYet')}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Divider
        label={tc('repliesFromSupportTeam')}
        labelPosition="center"
        className="mb-3"
      />
      {replies.map((reply) => (
        <div
          key={reply._id}
          className="bg-blue-50 p-3 rounded-md mb-3 border-l-4 border-blue-400"
        >
          <Group className="mb-2">
            <div>
              <Text size="sm" weight={500}>{tc('admin')}</Text>
              <Text size="xs" color="dimmed">
                {formatDate(reply.createdAt, currentLanguage)}
              </Text>
            </div>
          </Group>
          <Text size="sm">
            {reply.message}
          </Text>
        </div>
      ))}
    </div>
  );
};

const NotificationList = ({ tickets, isLoading }) => {
  const { tc, currentLanguage } = useBatchTranslation();
  const { mutate: deleteTicket, isLoading: isDeleting } = useDeleteTicket();
  
  if (isLoading) {
    return (
      <div className="my-4 bg-white p-4 md:p-8 rounded-xl border border-slate-300 shadow-xl">
        <Skeleton height={30} width="40%" radius="md" mb={20} />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-slate-200 pb-3">
              <Skeleton height={24} width="70%" radius="md" mb={10} />
              <Skeleton height={16} width="30%" radius="md" mb={15} />
              <Skeleton height={60} radius="md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return null;
  }

  return (
    <div className="my-4 bg-white p-4 md:p-8 rounded-xl border border-slate-300 shadow-xl">
      <p className="text-xl font-medium">{tc('recentTickets')}</p>

      <Accordion>
        {tickets.map((ticket) => (
          <Accordion.Item className="!mb-3" value={ticket._id} key={ticket._id}>
            <Accordion.Control className="!px-0 hover:!bg-transparent !border-b-1 !border-slate-300">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-slate-400">
                    {tc('postedOn')} {formatDate(ticket.createdAt, currentLanguage)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(
                      ticket.status
                    )}-100 text-${getStatusColor(ticket.status)}-800`}
                  >
                    {translateStatus(ticket.status, tc)}
                  </span>
                  {/** Priority hidden on barber side */}
                </div>
              </div>
            </Accordion.Control>
            <Accordion.Panel className="!py-3 !text-slate-500">
              <div>
                <p className="font-medium text-sm mb-1">{tc('yourQuestion')}</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  {ticket.issueDescription}
                </div>
                <TicketReplies replies={ticket.replies} />
                
                {ticket.resolvedAt && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                    <Text size="sm" weight={500} color="green">
                      {tc('resolvedOn')} {formatDate(ticket.resolvedAt, currentLanguage)}
                    </Text>
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <Button size="xs" color="red" variant="filled" onClick={() => deleteTicket(ticket._id)} loading={isDeleting}>
                    {tc('delete') || 'Delete'}
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

const Tickets = () => {
  const { tc } = useBatchTranslation();
  const { data, isLoading } = useMyTickets();
  const tickets = data?.supportTickets || [];
  const hasTickets = tickets && tickets.length > 0;

  return (
    <BatchTranslationLoader>
      <div className="h-[76vh] overflow-auto">
        <CreateTicket hasTickets={hasTickets} />
        {/** Filtering options removed on barber side */}
        <TicketNotification
          count={hasTickets ? tickets.length : 0}
          isLoading={isLoading}
        />
        <NotificationList tickets={tickets} isLoading={isLoading} />
      </div>
    </BatchTranslationLoader>
  );
};

export default Tickets;
