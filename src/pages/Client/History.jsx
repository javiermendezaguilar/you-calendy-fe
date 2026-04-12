import React, { useState, useRef } from "react";
import { Button, Textarea } from "@mantine/core";
import CommonModal from "../../components/common/CommonModal";
import { ReplyIcon, UploadImageIcon } from "../../components/common/Svgs";
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";
import customer from "../../assets/customer.webp"
import bg from "../../assets/background.webp"
import { useForm } from '@mantine/form';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const HistoryHeader = () => {
  const { tc } = useBatchTranslation();
  return (
    <header className="max-md:max-w-full mt-20">
      <h1 className="text-[rgba(50,51,52,1)] text-2xl font-medium">
        {tc('history')}
      </h1>
      <p className="text-[rgba(147,151,153,1)] text-md font-normal mt-1 max-md:max-w-full">
        {tc('reviewYourPastHaircuts')}
      </p>
    </header>
  );
};

const NoteConversationView = ({ notes, onAddReply, onCancel, onSubmit }) => {
  const [reply, setReply] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  return (
    <div className="flex flex-col p-4 gap-6">
      <div>
        <h2 className="text-[rgba(50,51,52,1)] text-2xl font-medium">{tc('addNote')}</h2>
        <p className="text-[rgba(147,151,153,1)] text-md font-normal mt-1">
          {tc('shareYourThoughtsForYourNextCut')}
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className="text-[rgba(50,51,52,1)] font-medium">{tc('addNoteHere')}</label>
        
        <div className="flex flex-col space-y-4 mb-4">
          {notes.map((note, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg max-w-[90%] ${
                note.isClient 
                  ? "bg-[#F8F8F8] self-start" 
                  : "bg-[#E5E5E5] self-end text-right"
              }`}
            >
              {note.text}
            </div>
          ))}
        </div>
        
        {showReplyForm ? (
          <div className="w-[60%]">
            <Textarea
              placeholder={tc('writeYourReply')}
              minRows={3}
              styles={{
                input: { minHeight: '80px', backgroundColor: '#F8F8F8' }
              }}
              value={reply}
              onChange={(e) => setReply(e.currentTarget.value)}
              className="w-full"
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyForm(false)}
                className="mr-2"
              >
                {tc('cancel')}
              </Button>
              <Button
                variant="filled"
                size="sm"
                color="dark"
                onClick={() => {
                  onAddReply(reply);
                  setReply("");
                  setShowReplyForm(false);
                }}
              >
                {tc('send')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="subtle"
            leftSection={
                <ReplyIcon />
            }
            onClick={() => setShowReplyForm(true)}
            className="!text-gray-700 !w-fit"
          >
            {tc('addReply')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 absolute bottom-10 left-0 right-0 px-10">
        <Button
          variant="filled"
          color="gray"
          radius="md"
          onClick={onCancel}
          className="!bg-gray-400 hover:!bg-gray-500"
        >
          {tc('cancel')}
        </Button>
        <Button
          variant="filled"
          color="dark"
          radius="md"
          onClick={onSubmit}
          className="!bg-[#323334] hover:!bg-[#1a1b1c]"
        >
          {tc('submit')}
        </Button>
      </div>
    </div>
  );
};

const AddNoteModalContent = ({ onCancel, onSubmit }) => {
  const { tc } = useBatchTranslation();
  const form = useForm({
    initialValues: {
      note: '',
      rating: 0,
    },
    validate: {
      note: (value) => (!value || value.trim().length === 0 ? tc('noteIsRequired') : null),
      rating: (value) => (value < 1 ? tc('pleaseGiveAtLeastOneStar') : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values.note, values.rating))} className="flex flex-col p-4 gap-6">
      <div>
        <h2 className="text-[rgba(50,51,52,1)] text-2xl font-medium">{tc('addNote')}</h2>
        <p className="text-[rgba(147,151,153,1)] text-md font-normal mt-1">
          {tc('shareYourThoughtsForYourNextCut')}
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className="text-[rgba(50,51,52,1)] font-medium mb-3">{tc('addNoteHere')}</label>
        <div className="relative w-[60%]">
          <Textarea
            placeholder={tc('writeHereAnyConsiderations')}
            minRows={8}
            styles={{
              input: { 
                minHeight: '130px', 
                height: '130px', 
                maxHeight: '130px', 
                backgroundColor: '#F8F8F8', 
                paddingBottom: '40px',
                overflow: 'auto'
              },
              error: { 
                position: 'absolute', 
                top: '-20px'
              }
            }}
            className="w-full"
            {...form.getInputProps('note')}
          />
          <div className="absolute bottom-3 left-3 z-10">
            <Button 
              variant="outline" 
              radius="xl" 
              size="sm"
              leftSection={<UploadImageIcon />}
              className="!bg-[#323334] !text-white !text-sm !font-normal"
              type="button"
            >
              {tc('uploadImage')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[rgba(50,51,52,1)] font-medium">{tc('givePersonalFeedback')}</label>
        <div className="flex items-center gap-2 p-4 bg-[#F8F8F8] rounded-lg w-fit">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => form.setFieldValue('rating', star)}
              className="focus:outline-none cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-6 h-6 ${star <= form.values.rating ? "fill-[#556B2F]" : "fill-[#D9D9D9]"}`}
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke={star <= form.values.rating ? "#7D9A4B" : "#D9D9D9"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
        {form.errors.rating && <div className="text-red-500 text-xs mt-1">{form.errors.rating}</div>}
      </div>

      <div className="flex flex-col gap-3 absolute bottom-10 left-0 right-0 px-10">
        <Button
          variant="filled"
          color="gray"
          radius="md"
          onClick={onCancel}
          className="!bg-gray-400 hover:!bg-gray-500"
          type="button"
        >
          {tc('cancel')}
        </Button>
        <Button
          variant="filled"
          color="dark"
          radius="md"
          type="submit"
          className="!bg-[#323334] hover:!bg-[#1a1b1c]"
        >
          {tc('submit')}
        </Button>
      </div>
    </form>
  );
};

const ServiceCard = ({
  imageUrl,
  serviceName,
  barberName,
  dateTime,
  hasNote = false,
  onAddNote,
  onEditNote,
}) => {
  const fileInputRef = useRef(null);
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // File loaded successfully
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white shadow-[0px_27px_37px_-27px_rgba(38,44,61,0.1)] border flex w-full items-stretch gap-5 flex-wrap justify-between pl-[19px] pr-[47px] py-[17px] rounded-2xl border-[rgba(235,235,235,1)] border-solid max-md:max-w-full max-md:pr-5">
      <div className="flex items-stretch gap-[40px_100px] flex-wrap max-md:max-w-full">
        <div className="flex items-stretch gap-6">
          <div className="relative">
            <img
              src={imageUrl}
              alt={serviceName}
              className="aspect-[1.58] object-contain w-[141px] shrink-0 max-w-full rounded-lg"
            />
            {hasNote && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col items-stretch my-auto">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light">
              {tc('service')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {serviceName}
            </div>
          </div>
        </div>
        <div className="flex items-stretch gap-[40px_100px] my-auto">
          <div className="flex flex-col items-stretch">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light leading-loose">
              {tc('barberName')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {barberName}
            </div>
          </div>
          <div className="flex flex-col items-stretch">
            <div className="text-[rgba(147,175,214,1)] text-sm font-light leading-loose">
              {tc('dateTime')}
            </div>
            <div className="text-[rgba(50,51,52,1)] text-md font-medium leading-none mt-[11px]">
              {dateTime}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 items-center mt-[20px]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <Button
          variant="filled"
          color="dark"
          radius="lg"
          size="md"
          className="!flex !items-center !gap-2 !min-h-[40px]"
          leftSection={
            <UploadImageIcon />
          }
          onClick={handleUploadClick}
        >
          {tc('uploadPhoto')}
        </Button>
        {hasNote ? (
          <Button
            color="rgba(125,154,75,1)"
            radius="lg"
            size="md"
            className="!flex !items-center !gap-2 !min-h-[40px]"
            leftSection={
              <AiOutlineEdit size={14} />
            }
            onClick={onEditNote}
          >
            {tc('editNote')}
          </Button>
        ) : (
          <Button
            color="rgba(125,154,75,1)"
            radius="lg"
            size="md"
            className="!flex !items-center !gap-2 !min-h-[40px]"
            leftSection={
              <AiOutlinePlus size={12} />
            }
            onClick={onAddNote}
          >
            {tc('addNote')}
          </Button>
        )}
      </div>
    </div>
  );
};

const serviceData = [
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James",
    dateTime: "17 Aug, 2025 - 09:30",
    hasNote: true,
  },
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James",
    dateTime: "17 Aug, 2025 - 09:30",
  },
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James", 
    dateTime: "17 Aug, 2025 - 09:30",
  },
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James",
    dateTime: "17 Aug, 2025 - 09:30",
  },
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James",
    dateTime: "17 Aug, 2025 - 09:30",
  },
  {
    imageUrl: customer,
    serviceName: "Skin Fade",
    barberName: "Robert James",
    dateTime: "17 Aug, 2025 - 09:30",
  },
];

const History = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(null);
  const [viewMode, setViewMode] = useState("add");
  const [conversations, setConversations] = useState({});

  const handleAddNote = (index) => {
    setSelectedServiceIndex(index);
    
    if (conversations[index] && conversations[index].length > 0) {
      setViewMode("conversation");
    } else {
      setViewMode("add");
    }
    
    setModalOpen(true);
  };

  const handleEditNote = (index) => {
    setSelectedServiceIndex(index);
    setViewMode("conversation");
    setModalOpen(true);
  };

  const handleSubmitNote = (note, rating = 0) => {
    const serviceIndex = selectedServiceIndex;
    const updatedConversations = { ...conversations };
    
    if (!updatedConversations[serviceIndex]) {
      updatedConversations[serviceIndex] = [];
    }
    
    updatedConversations[serviceIndex].push({
      text: note,
      rating: rating,
      isClient: true,
      timestamp: new Date()
    });
    
    updatedConversations[serviceIndex].push({
      text: tc('gotItIllKeepTheSidesLonger'),
      isClient: false,
      timestamp: new Date()
    });
    
    setConversations(updatedConversations);
    
    const updatedServiceData = [...serviceData];
    updatedServiceData[selectedServiceIndex].hasNote = true;
    
    setModalOpen(false);
  };

  const handleAddReply = (reply) => {
    if (!reply.trim()) return;
    
    const serviceIndex = selectedServiceIndex;
    const updatedConversations = { ...conversations };
    
    updatedConversations[serviceIndex].push({
      text: reply,
      isClient: true,
      timestamp: new Date()
    });
    
    setConversations(updatedConversations);
  };

  return (
    <main 
      className="w-full" 
      style={{ 
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[78%] mx-auto px-4 py-8">
        <section className="flex flex-col items-stretch">
          <HistoryHeader />
          <div className="flex flex-col gap-[25px] mt-10">
            {serviceData.map((service, index) => (
              <ServiceCard
                key={index}
                imageUrl={service.imageUrl}
                serviceName={service.serviceName}
                barberName={service.barberName}
                dateTime={service.dateTime}
                hasNote={service.hasNote}
                onAddNote={() => handleAddNote(index)}
                onEditNote={() => handleEditNote(index)}
              />
            ))}
          </div>
        </section>
      </div>

      <CommonModal
        opened={modalOpen}
        close={() => setModalOpen(false)}
        size="xl"
        content={
          viewMode === "add" ? (
            <AddNoteModalContent
              onCancel={() => setModalOpen(false)}
              onSubmit={handleSubmitNote}
            />
          ) : (
            <NoteConversationView
              notes={conversations[selectedServiceIndex] || []}
              onAddReply={handleAddReply}
              onCancel={() => setModalOpen(false)}
              onSubmit={() => setModalOpen(false)}
            />
          )
        }
        className="!w-full !max-w-full"
        styles={{
          content: { maxWidth: "850px" },
          body: { 
            padding: "24px", 
            minHeight: "650px", 
            maxHeight: "90vh", 
            overflowY: "visible"
          }
        }}
      />
    </main>
  );
};

export default History;
