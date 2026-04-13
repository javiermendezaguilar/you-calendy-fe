import React, { useState, useEffect } from "react";
import { Button, Textarea, Tabs, Skeleton } from "@mantine/core";
import CommonModal from "../../components/common/CommonModal";
import { businessAPI } from "../../services/businessAPI";
import customer from "../../assets/customer.webp";
import { SendClientNoteIcon, ViewNoteIcon, StartIcon } from "../../components/common/Svgs";
import { X } from "tabler-icons-react";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { toast } from "sonner";

// Normalize image URLs coming from API that may include stray backticks/spaces
const normalizeImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') {
    // Trim spaces and strip accidental backticks and quotes
    return img.trim().replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '');
  }
  if (typeof img === 'object') {
    // Handle possible Cloudinary or file objects
    return img.url || img.secure_url || null;
  }
  return null;
};

const ClientsNotesHeader = () => {
  const { tc } = useBatchTranslation();
  
  return (
    <header className="max-md:max-w-full">
      <h1 className="text-[rgba(50,51,52,1)] text-2xl font-medium">
        {tc('clientsNotes')}
      </h1>
      <p className="text-[rgba(147,151,153,1)] text-md font-normal mt-1 max-md:max-w-full">
        {tc('clientsNotesDescription')}
      </p>
    </header>
  );
};

const ClientCard = ({
  imageUrl,
  clientName,
  phoneNumber,
  lastVisit,
  onViewNote,
  activeTab,
}) => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className="bg-white shadow-[0px_27px_37px_-27px_rgba(38,44,61,0.1)] border flex w-full items-center gap-5 flex-wrap justify-between pl-[19px] pr-[47px] py-[17px] rounded-2xl border-[rgba(235,235,235,1)] border-solid max-md:max-w-full max-md:pr-5">
      <div className="flex items-center gap-[40px] flex-wrap max-md:max-w-full">
        <div className="flex items-center gap-6">
          <img
            src={imageUrl}
            alt={clientName}
            className="aspect-square object-cover w-[60px] h-[60px] shrink-0 rounded-full"
            onError={(e) => {
              e.currentTarget.src = customer;
            }}
          />
          <div className="flex flex-col">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light">
              {tc('clientName')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {clientName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[40px]">
          <div className="flex flex-col">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light leading-loose">
              {tc('phoneNumber')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {phoneNumber}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light leading-loose">
              {tc('lastVisit')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {lastVisit}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button
          variant="filled"
          color={activeTab === "suggestions" ? "#7D9A4B" : "rgba(201,75,75,1)"}
          radius="lg"
          size="md"
          className="!flex !items-center !gap-2 !min-h-[40px]"
          onClick={onViewNote}
          leftSection={
            <ViewNoteIcon />
          }
        >
          {activeTab === "suggestions" ? tc('viewSuggestion') : tc('viewReport')}
        </Button>
      </div>
    </div>
  );
};

const NoteViewContent = ({ clientData, activeTab, onClose, onUpdated }) => {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const { tc } = useBatchTranslation();
  
  if (!clientData) {
    return (
      <div className="flex flex-col p-3 gap-4 relative min-h-[550px]">
        <div className="absolute -right-7 -top-7 z-20">
          <Button
            onClick={onClose}
            variant="subtle"
            p={0}
            className="!p-0 !w-10 !h-10 !rounded-full !bg-[#636363] !hover:bg-gray-700 !transition-colors !inline-flex !items-center !justify-center"
            aria-label="Close note modal"
          >
            <X size={24} className="text-white" />
          </Button>
        </div>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">{tc('noDataAvailable')}</p>
        </div>
      </div>
    );
  }
  
  const isReport = activeTab === "issues";
  const noteType = isReport ? tc('issueReport') : tc('suggestionNote');

  const handleSendResponse = async () => {
    const trimmed = reply.trim();
    if (!trimmed) {
      toast.error(tc('pleaseEnterAResponse') || 'Please enter a response');
      return;
    }
    if (!clientData?.id) {
      toast.error('Missing note id');
      return;
    }
    try {
      setSending(true);
      // For reports we can optionally include a status; keep minimal and only send response
      await businessAPI.respondToClientNote(clientData.id, { response: trimmed });
      toast.success(tc('responseSent') || 'Response sent');
      setReply("");
      // Update local item so chat shows immediately
      const now = new Date().toISOString();
      const updated = {
        ...clientData,
        response: trimmed,
        respondedAt: now,
        respondedBy: 'me',
      };
      onUpdated?.(updated, isReport ? 'issues' : 'suggestions');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send response';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="flex flex-col p-3 gap-4 relative min-h-[550px]">
      <div className="absolute -right-7 -top-7 z-20">
        <Button
          onClick={onClose}
          variant="subtle"
          p={0}
          className="!p-0 !w-10 !h-10 !rounded-full !bg-[#636363] !hover:bg-gray-700 !transition-colors !inline-flex !items-center !justify-center"
          aria-label="Close note modal"
        >
          <X size={24} className="text-white" />
        </Button>
      </div>
      
      <div className="mb-1">
        <h2 className="text-[rgba(50,51,52,1)] text-2xl font-medium">
          {noteType}
        </h2>
        <p className="text-[rgba(147,151,153,1)] text-sm font-normal">
          {tc('from')} {clientData.clientName} • {clientData.lastVisit}
        </p>
      </div>
      
      <div className="bg-[#F9F9F9] p-5 rounded-lg flex gap-3">
        <div className="flex-1">
          {/* Chat-like thread */}
          <div className="mb-4 space-y-3">
            {/* Client message */}
            <div className="max-w-[85%]">
              <div className="text-xs text-gray-500 mb-1">{tc('client')}</div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                {clientData.content || tc('noContentAvailable')}
              </div>
            </div>
            {/* Barber response (if any) */}
            {clientData.response && (
              <div className="max-w-[85%] ml-auto">
                <div className="text-xs text-gray-500 text-right mb-1">{tc('you') || 'You'}</div>
                <div className="bg-[#EAF2D7] border border-[#dbe7be] rounded-lg p-3 text-sm">
                  {clientData.response}
                </div>
                {clientData.respondedAt && (
                  <div className="text-[10px] text-gray-500 text-right mt-1">
                    {new Date(clientData.respondedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
          

           
           {isReport && (clientData.rating || clientData.rating === 0) && (
             <div className="mb-4">
               <h4 className="text-[rgba(50,51,52,1)] text-sm font-medium mb-1">
                 {tc('rating')}:
               </h4>
               <div className="flex items-center gap-2">
                 <div className="flex items-center">
                   {[...Array(5)].map((_, i) => (
                     <StartIcon
                       key={i}
                       size={16}
                       fill={i < (Number(clientData.rating) || 0) ? '#FBBF24' : '#E5E7EB'}
                       stroke={i < (Number(clientData.rating) || 0) ? '#F59E0B' : '#D1D5DB'}
                       className="mr-0.5"
                     />
                   ))}
                 </div>
                  <span className="text-xs text-gray-600">({Number(clientData.rating) || 0}/5)</span>
               </div>
             </div>
           )}
          
          <hr className="my-4 border-gray-200" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#323334]">
              {tc('client')}: {clientData.clientName} • {tc('phone')}: {clientData.phoneNumber}
            </span>
          </div>
        </div>
        
        {/* Show images if available */}
         {(clientData.galleryImage || (clientData.images && clientData.images.length > 0)) && (
           <div className="flex flex-col w-[120px] ml-2">
             {/* Gallery image */}
             {clientData.galleryImage && (
               <div className="w-full mb-2">
                 <img 
                   src={clientData.galleryImage} 
                   alt="Related haircut" 
                   className="w-full h-[75px] object-cover rounded-md shadow-sm"
                   onError={(e) => {
                     e.target.style.display = 'none';
                   }}
                 />
                 {clientData.galleryTitle && (
                   <p className="text-xs text-gray-600 text-center mt-1">
                     {clientData.galleryTitle}
                   </p>
                 )}
               </div>
             )}
             
             {/* Additional images from suggestion/report */}
             {clientData.images && clientData.images.length > 0 && (
               <div className="flex flex-wrap gap-1">
                 {clientData.images.slice(0, 3).map((image, index) => (
                   <img 
                     key={index}
                     src={image} 
                     alt={`${isReport ? tc('issueReport') : tc('suggestionNote')} image ${index + 1}`} 
                     className="w-[36px] h-[36px] object-cover rounded-md shadow-sm"
                     onError={(e) => {
                       e.target.style.display = 'none';
                     }}
                   />
                 ))}
                 {clientData.images.length > 3 && (
                   <div className="w-[36px] h-[36px] bg-gray-200 rounded-md flex items-center justify-center">
                     <span className="text-xs text-gray-600">+{clientData.images.length - 3}</span>
                   </div>
                 )}
               </div>
             )}
           </div>
         )}
      </div>

  <div className="absolute bottom-10 left-10 right-10 flex justify-between mt-auto">
        <Textarea
          placeholder={tc('respondHere')}
          value={reply}
          onChange={(e) => setReply(e.currentTarget.value)}
          className="w-[80%]"
          styles={{
            input: {
              borderRadius: "8px",
              minHeight: "50px",
              backgroundColor: "#F8F8F8",
              fontSize: "14px",
              paddingRight: "70px"
            }
          }}
        />
        <Button
          variant="filled"
          radius="md"
          className="!bg-[#7D9A4B] !h-[56px]"
          onClick={handleSendResponse}
          disabled={sending || !reply.trim()}
          rightSection={
            <SendClientNoteIcon />
          }
        >
          {sending ? tc('sending') || 'Sending…' : tc('send')}
        </Button>
      </div>
    </div>
  );
};

const ClientsNote = () => {
  const { tc } = useBatchTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [containerHeight, setContainerHeight] = useState("100vh");
  const [activeTab, setActiveTab] = useState("suggestions");
  const [suggestionsData, setSuggestionsData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [badgeCounts, setBadgeCounts] = useState({
    suggestions: 0,
    reports: 0,
  });

  useEffect(() => {
    setContainerHeight(`${window.innerHeight - 10}px`);
    
    const handleResize = () => {
      setContainerHeight(`${window.innerHeight - 10}px`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch counts for badges
        const countsResponse = await businessAPI.getClientNoteCounts();
        if (countsResponse.data.success) {
          setBadgeCounts(countsResponse.data.data);
        }
        
        // Fetch suggestions
        const suggestionsResponse = await businessAPI.getClientSuggestions();
        if (suggestionsResponse.data.success) {
          const responseData = suggestionsResponse.data.data;
          // Extract the suggestions array from the response object
          const suggestionsArray = responseData?.suggestions || responseData;
          setSuggestionsData(Array.isArray(suggestionsArray) ? suggestionsArray : []);
        }
        
        // Fetch reports
        const reportsResponse = await businessAPI.getClientReports();
        if (reportsResponse.data.success) {
          const responseData = reportsResponse.data.data;
          // Extract the reports array from the response object
          const reportsArray = responseData?.reports || responseData;
          setReportsData(Array.isArray(reportsArray) ? reportsArray : []);
        }
      } catch (error) {
        console.error('Error fetching client notes data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform API data to match component expectations
  const transformNoteData = (notes) => {
    // Ensure notes is an array before mapping
    if (!Array.isArray(notes)) {
      console.warn('transformNoteData received non-array data. Expected array but got:', typeof notes, notes);
      return [];
    }
    
    if (notes.length === 0) {
      return [];
    }
    
  return notes.map(note => {
      // Handle client data - the clientId field contains the populated client object
      let clientName = 'Unknown Client';
      let phoneNumber = 'No phone';
      let profileImage = null;
      
      if (note.clientId && typeof note.clientId === 'object') {
        // Client data is populated from the backend
        const firstName = note.clientId.firstName || '';
        const lastName = note.clientId.lastName || '';
        clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';
        phoneNumber = note.clientId.phone || 'No phone';
        profileImage = normalizeImageUrl(note.clientId.profileImage) || null;
      }
      
      // Normalize response fields for chat UI
      const normalizedResponse = note.response || note.reviewNote || null;
      const normalizedRespondedAt = note.respondedAt || note.reviewedAt || null;
      const normalizedRespondedBy = note.respondedBy || note.reviewedBy || null;

      // Normalize gallery image and any additional images
      const normalizedGalleryImage = normalizeImageUrl(note.galleryImage);
      const normalizedImages = Array.isArray(note.images)
        ? note.images.map(normalizeImageUrl).filter(Boolean)
        : [];

      return {
        id: note._id,
        imageUrl: profileImage || customer, // use client's profile image when available
        clientName,
        phoneNumber,
        lastVisit: new Date(note.createdAt).toLocaleDateString(),
        content: note.content,
        status: note.status,
        type: note.type,
        reportType: note.reportType,
        createdAt: note.createdAt,
        // Additional fields from the updated API response
        galleryId: note.galleryId,
        galleryImage: normalizedGalleryImage,
        galleryTitle: note.galleryTitle,
        images: normalizedImages,
        rating: note.rating,
        reviewNote: note.reviewNote,
        reviewedBy: note.reviewedBy,
        reviewedAt: note.reviewedAt,
        // Unified fields used by chat UI
        response: normalizedResponse,
        respondedAt: normalizedRespondedAt,
        respondedBy: normalizedRespondedBy,
      };
    });
  };

  const transformedSuggestionsData = transformNoteData(suggestionsData);
  const transformedReportsData = transformNoteData(reportsData);

  const handleViewNote = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleNoteUpdated = (updatedNote, tabKey) => {
    // Update the selected client and the list in place
    setSelectedClient(updatedNote);
    if (tabKey === 'suggestions') {
      setSuggestionsData(prev => prev.map(n => (n._id === updatedNote.id ? { ...n, response: updatedNote.response, respondedAt: updatedNote.respondedAt, respondedBy: updatedNote.respondedBy } : n)));
    } else {
      setReportsData(prev => prev.map(n => (n._id === updatedNote.id ? { ...n, response: updatedNote.response, respondedAt: updatedNote.respondedAt, respondedBy: updatedNote.respondedBy } : n)));
    }
  };

  const modalStyles = {
    content: { 
      maxWidth: "650px",
      width: "100%",
      borderRadius: "12px",
      overflow: "visible",
      position: "relative"
    },
    body: {
      padding: "16px",
      minHeight: "550px",
      maxHeight: "90vh",
      overflowY: "visible",
      overflowX: "visible",
      position: "relative"
    },
    inner: {
      overflow: "visible"
    },
    header: {
      display: "none",
    },
  };

  return (
    <BatchTranslationLoader>
      <div 
        className="flex flex-col w-full overflow-hidden" 
        style={{ height: containerHeight }}
      >
      <div 
        className="flex-1 overflow-auto w-full"
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          height: "100%",
        }}
      >
        <div className="w-full px-4 py-8">
          <section className="flex flex-col items-stretch">
            <ClientsNotesHeader />
            
            <div className="mt-4 border-b border-gray-200">
              <Tabs
                value={activeTab}
                onChange={setActiveTab}
                styles={{
                  tab: {
                    color: 'rgba(147,151,153,1)',
                    background: '#f3f7ec',
                    borderRadius: '8px 8px 0 0',
                    marginRight: '8px',
                    padding: '10px 24px',
                    fontWeight: 500,
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&[data-active="true"]': {
                      color: '#fff !important',
                      background: '#7D9A4B !important',
                      borderBottomColor: '#7D9A4B !important',
                      borderBottomWidth: '2px !important',
                      fontWeight: '600 !important',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
                    },
                  }
                }}
                classNames={{
                  tabsList: "!border-0 flex gap-2",
                  tab: "!px-4 !py-2 !text-base !border-b-2 !border-transparent !transition-all !rounded-t-xl !bg-gray-100 !font-medium relative !shadow-sm data-[active=true]:!bg-[#7D9A4B] data-[active=true]:!text-white",
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="suggestions" className="">
                    <span className="flex items-center">
                      {tc('suggestionNotes')}
                      {badgeCounts.suggestions > 0 && (
                        <span className="ml-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 min-w-[16px] flex items-center justify-center border border-white shadow-sm">
                          {badgeCounts.suggestions}
                        </span>
                      )}
                    </span>
                  </Tabs.Tab>
                  <Tabs.Tab value="issues" className="">
                    <span className="flex items-center">
                      {tc('issueReports')}
                      {badgeCounts.reports > 0 && (
                        <span className="ml-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 min-w-[16px] flex items-center justify-center border border-white shadow-sm">
                          {badgeCounts.reports}
                        </span>
                      )}
                    </span>
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </div>
            
            <div className="flex flex-col gap-[25px] mt-6 pb-24">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <Skeleton height={60} width={60} radius="xl" />
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <Skeleton height={20} width="40%" />
                              <Skeleton height={16} width="30%" />
                            </div>
                            <Skeleton height={16} width="20%" />
                          </div>
                          <Skeleton height={14} width="25%" />
                          <Skeleton height={36} width="25%" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "suggestions" ? (
                transformedSuggestionsData.length > 0 ? (
                  transformedSuggestionsData.map((client, index) => (
                    <ClientCard
                      key={client.id || index}
                      imageUrl={client.imageUrl}
                      clientName={client.clientName}
                      phoneNumber={client.phoneNumber}
                      lastVisit={client.lastVisit}
                      onViewNote={() => handleViewNote(client)}
                      activeTab={activeTab}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">{tc('noSuggestionNotesFound')}</div>
                  </div>
                )
              ) : (
                transformedReportsData.length > 0 ? (
                  transformedReportsData.map((client, index) => (
                    <ClientCard
                      key={client.id || index}
                      imageUrl={client.imageUrl}
                      clientName={client.clientName}
                      phoneNumber={client.phoneNumber}
                      lastVisit={client.lastVisit}
                      onViewNote={() => handleViewNote(client)}
                      activeTab={activeTab}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">{tc('noIssueReportsFound')}</div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>

      <CommonModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        content={
          <NoteViewContent
            clientData={selectedClient}
            activeTab={activeTab}
            onClose={() => setModalOpen(false)}
            onUpdated={handleNoteUpdated}
          />
        }
        className="!w-full"
        styles={modalStyles}
      />
      </div>
    </BatchTranslationLoader>
  );
};

export default ClientsNote;
