import React, { useState, useMemo } from "react";
import {
  Button,
  TextInput,
  Group,
  Text,
  Skeleton,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { IoArrowBackCircleOutline, IoChevronForward } from "react-icons/io5";
import { Link } from "react-router-dom";
import {
  IconCalendar,
  IconPlus,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import CommonModal from "../../components/common/CommonModal";
import DeleteModal from "../../components/common/DeleteModal";
import {
  useCreateFlashSale,
  useGetFlashSales,
  useUpdateFlashSale,
  useDeleteFlashSale,
  useToggleFlashSaleStatus,
} from "../../hooks/useMarketing";
import { format, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";

const FlashSaleForm = ({ flashSale, onClose, onSubmit, isLoading }) => {
  const { tc } = useBatchTranslation();
  const [name, setName] = useState(flashSale?.name || "");
  const [description, setDescription] = useState(flashSale?.description || "");
  const [discount, setDiscount] = useState(flashSale?.discountPercentage || 10);
  const [startDate, setStartDate] = useState(
    flashSale?.startDate ? new Date(flashSale.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    flashSale?.endDate ? new Date(flashSale.endDate) : null
  );

  const increaseDiscount = () => {
    setDiscount((prev) => (prev < 100 ? prev + 1 : prev));
  };

  const decreaseDiscount = () => {
    setDiscount((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error(tc("pleaseSelectStartAndEndDate"));
      return;
    }
    if (endDate <= startDate) {
      toast.error(tc("endDateMustBeAfterStartDate"));
      return;
    }
    const payload = {
      name: name || `${tc("flashSale")} - ${discount}% ${tc("off")}`,
      description: description || `${tc("aFlashSaleOffering")} ${discount}% ${tc("discount")}.`,
      discountPercentage: discount,
      startDate,
      endDate,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-slate-700 mb-2">{tc("flashSaleName")}</p>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder={tc("enterFlashSaleName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <p className="text-sm text-slate-700 mb-2">{tc("description")}</p>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder={tc("enterDescription")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <p className="text-sm text-slate-700 mb-2">{tc("flashSaleDiscount")}</p>
          <div className="w-full p-3 rounded-xl flex justify-between items-center border border-slate-200 shadow-sm">
            <div
              onClick={decreaseDiscount}
              className="shadow-sm cursor-pointer p-3 rounded-full border border-slate-200 flex justify-center items-center hover:bg-slate-50 transition-colors"
            >
              <FaMinus color="#93AFD6" />
            </div>
            <p className="text-2xl font-semibold">{discount}%</p>
            <div
              onClick={increaseDiscount}
              className="shadow-sm cursor-pointer p-3 rounded-full border border-slate-200 flex justify-center items-center hover:bg-slate-50 transition-colors"
            >
              <FaPlus color="#93AFD6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{tc("offTheServicePrice")}</p>
        </div>
        <div>
          <p className="text-sm text-slate-700 mb-2">{tc("startDate")}</p>
          <DateInput
            variant="filled"
            size="md"
            placeholder={tc("selectStartDate")}
            value={startDate}
            onChange={setStartDate}
            rightSection={<IconCalendar size={18} />}
            required
            clearable
          />
        </div>
        <div>
          <p className="text-sm text-slate-700 mb-2">{tc("endDate")}</p>
          <DateInput
            variant="filled"
            size="md"
            placeholder={tc("selectEndDate")}
            value={endDate}
            onChange={setEndDate}
            rightSection={<IconCalendar size={18} />}
            required
            clearable
            minDate={startDate || undefined}
          />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button type="submit" loading={isLoading} bg="#323334">
            {flashSale ? tc("update") : tc("create")}
          </Button>
        </div>
      </div>
    </form>
  );
};

const FlashSale = () => {
  const { tc } = useBatchTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState(null);
  const [promotionOverlap, setPromotionOverlap] = useState(null);
  const [pendingFlashSaleId, setPendingFlashSaleId] = useState(null);
  const [promotionModalOpened, { open: openPromotionModal, close: closePromotionModal }] = useDisclosure(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'create', 'update', or 'toggle'

  const { data: flashSales = [], isLoading } = useGetFlashSales();
  const createMutation = useCreateFlashSale();
  const updateMutation = useUpdateFlashSale();
  const deleteMutation = useDeleteFlashSale();
  const toggleMutation = useToggleFlashSaleStatus();

  const filteredFlashSales = useMemo(() => {
    // Ensure flashSales is always an array
    const salesArray = Array.isArray(flashSales) ? flashSales : [];
    let filtered = salesArray;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (sale) =>
          sale.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sale.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((sale) => {
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        switch (statusFilter) {
          case "active":
            return sale.isActive && now >= startDate && now <= endDate;
          case "upcoming":
            return sale.isActive && isBefore(now, startDate);
          case "ended":
            return isAfter(now, endDate);
          case "inactive":
            return !sale.isActive;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [flashSales, searchQuery, statusFilter]);

  const handleCreate = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setCreateModalOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
      },
      onError: (error) => {
        if (error.isPromotionOverlap) {
          setCreateModalOpen(false); // Close flash sale form modal
          setPromotionOverlap(error.promotionData);
          setPendingPayload(payload);
          setPendingAction('create');
          setLoadingButton(null);
          openPromotionModal();
        }
      },
    });
  };

  const handleEdit = (flashSale) => {
    setSelectedFlashSale(flashSale);
    setEditModalOpen(true);
  };

  const handleUpdate = (payload) => {
    updateMutation.mutate(
      { id: selectedFlashSale._id, payload },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedFlashSale(null);
          setPendingPayload(null);
          setPendingAction(null);
        },
        onError: (error) => {
          if (error.isPromotionOverlap) {
            setEditModalOpen(false); // Close flash sale edit modal
            setPromotionOverlap(error.promotionData);
            setPendingFlashSaleId(selectedFlashSale._id);
            setPendingPayload(payload);
            setPendingAction('update');
            setLoadingButton(null);
            openPromotionModal();
          }
        },
      }
    );
  };

  const handleDelete = (flashSale) => {
    setSelectedFlashSale(flashSale);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedFlashSale._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedFlashSale(null);
      },
    });
  };

  const handleToggle = (id) => {
    toggleMutation.mutate(
      { id },
      {
        onError: (error) => {
          if (error.isPromotionOverlap) {
            setPromotionOverlap(error.promotionData);
            setPendingFlashSaleId(id);
            setPendingAction('toggle');
            setLoadingButton(null);
            openPromotionModal();
          }
        },
      }
    );
  };

  const handlePromotionConfirm = (applyBothDiscounts) => {
    if (pendingAction === 'create') {
      setLoadingButton(applyBothDiscounts ? 'yes' : 'no');
      createMutation.mutate(
        { ...pendingPayload, applyBothDiscounts },
        {
          onSuccess: () => {
            closePromotionModal();
            // Create modal is already closed, just clean up
            setPromotionOverlap(null);
            setPendingPayload(null);
            setPendingAction(null);
            setLoadingButton(null);
          },
          onError: () => {
            setLoadingButton(null);
          },
        }
      );
    } else if (pendingAction === 'update') {
      setLoadingButton(applyBothDiscounts ? 'yes' : 'no');
      updateMutation.mutate(
        { id: pendingFlashSaleId, payload: { ...pendingPayload, applyBothDiscounts } },
        {
          onSuccess: () => {
            closePromotionModal();
            // Edit modal is already closed, just clean up
            setSelectedFlashSale(null);
            setPromotionOverlap(null);
            setPendingFlashSaleId(null);
            setPendingPayload(null);
            setPendingAction(null);
            setLoadingButton(null);
          },
          onError: () => {
            setLoadingButton(null);
          },
        }
      );
    } else if (pendingAction === 'toggle') {
      setLoadingButton(applyBothDiscounts ? 'yes' : 'no');
      toggleMutation.mutate(
        { id: pendingFlashSaleId, applyBothDiscounts },
        {
          onSuccess: () => {
            closePromotionModal();
            setPromotionOverlap(null);
            setPendingFlashSaleId(null);
            setPendingAction(null);
            setLoadingButton(null);
          },
          onError: () => {
            setLoadingButton(null);
          },
        }
      );
    }
  };

  const getStatus = (flashSale) => {
    const now = new Date();
    const startDate = new Date(flashSale.startDate);
    const endDate = new Date(flashSale.endDate);

    if (!flashSale.isActive) {
      return { label: tc("inactive"), color: "stone", isActive: false };
    }
    if (isBefore(now, startDate)) {
      return { label: tc("upcoming"), color: "blue", isActive: true };
    }
    if (isAfter(now, endDate)) {
      return { label: tc("ended"), color: "red", isActive: false };
    }
    return { label: tc("active"), color: "green", isActive: true };
  };

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <Link
            to={"/dashboard/marketing/promotions"}
            className="flex w-auto mb-4"
          >
            <Button
              size="lg"
              className="sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
            >
              <IoArrowBackCircleOutline
                size={24}
                className="me-2 hidden sm:block"
              />
              {tc("goBack")}
            </Button>
          </Link>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setCreateModalOpen(true)}
            bg="#323334"
            size="md"
          >
            {tc("createFlashSale")}
          </Button>
        </div>

        <div className="lg:w-1/2">
          <p className="text-2xl text-slate-800 font-semibold">
            {tc("flashSale")}
          </p>
          <p className="text-sm text-slate-400">
            {tc("boostYourBookingsWithLimitedTimeOffer")}
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
            <div className="flex-1">
              <TextInput
                placeholder={tc("searchFlashSales")}
                leftSection={<IconSearch size={18} color="#7184B4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                radius="md"
                size="md"
                styles={{
                  input: {
                    backgroundColor: "#F9F9F9",
                    border: "1px solid #E6E6E6",
                    fontSize: "14px",
                    height: "48px",
                    boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                    "&:focus": {
                      borderColor: "#93AFD6",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0px 2px 8px 0px rgba(147, 175, 214, 0.15)",
                    },
                    "&::placeholder": {
                      color: "#9CA3AF",
                    },
                  },
                }}
              />
            </div>
            <div className="sm:w-[120px]">
              <Select
                placeholder={tc("filterByStatus")}
                
                value={statusFilter}
                onChange={setStatusFilter}
                radius="md"
                size="md"
                data={[
                  { value: "all", label: tc("all") },
                  { value: "active", label: tc("active") },
                  { value: "upcoming", label: tc("upcoming") },
                  { value: "ended", label: tc("ended") },
                  { value: "inactive", label: tc("inactive") },
                ]}
                styles={{
                  input: {
                    backgroundColor: "#F9F9F9",
                    border: "1px solid #E6E6E6",
                    fontSize: "14px",
                    height: "48px",
                    boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                    "&:focus": {
                      borderColor: "#93AFD6",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0px 2px 8px 0px rgba(147, 175, 214, 0.15)",
                    },
                    "&::placeholder": {
                      color: "#9CA3AF",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Flash Sales List */}
          <div className="md:w-2/3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton height={10} width={10} radius="xl" />
                      <Skeleton height={16} width="15%" />
                    </div>
                    <div className="flex gap-2 items-center justify-between">
                      <div>
                        <Skeleton height={24} width="40%" mb="sm" />
                        <Skeleton height={16} width="60%" />
                      </div>
                      <Skeleton height={20} width={20} radius="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFlashSales.length === 0 ? null : (
              filteredFlashSales.map((flashSale) => {
                const status = getStatus(flashSale);
                const isActiveStatus = status.isActive && status.color === "green";
                const startDate = new Date(flashSale.startDate);
                const endDate = new Date(flashSale.endDate);

                return (
                  <div key={flashSale._id} className="my-4">
                    <p
                      className={`text-stone-500 flex items-center gap-2 ${
                        isActiveStatus ? "text-green-600" : ""
                      }`}
                    >
                      <span
                        className={`${
                          isActiveStatus ? "bg-green-600" : "bg-stone-600"
                        } w-2.5 h-2.5 rounded-2xl block`}
                      ></span>
                      {status.label}
                    </p>
                    <div
                      onClick={() => handleEdit(flashSale)}
                      className={`cursor-pointer flex gap-4 items-center justify-between px-6 py-5 ${
                        isActiveStatus
                          ? "bg-green-50 border-green-100"
                          : "bg-slate-50 border-slate-100"
                      } border rounded-xl`}
                    >
                      <div className="flex-1">
                        <p className="text-xl font-semibold text-stone-800 mb-1">
                          {flashSale.name}
                        </p>
                        {flashSale.description && (
                          <p className="text-stone-500 font-light text-sm mt-2 mb-2">
                            {flashSale.description}
                          </p>
                        )}
                        <div className="mt-3 flex gap-4">
                          <p className="text-stone-600 font-medium text-sm">
                            {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                          </p>
                          <p className="text-green-600 font-semibold text-sm">
                            {flashSale.discountPercentage}% {tc("off")}
                          </p>
                        </div>
                </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(flashSale._id);
                            }}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                              flashSale.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {flashSale.isActive ? tc("active") : tc("inactive")}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(flashSale);
                            }}
                            className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                          >
                            {tc("delete")}
                          </button>
                        </div>
                        <IoChevronForward color="#93AFD6" size={20} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
                </div>
              </div>

        {/* Create Modal */}
        <CommonModal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          content={
            <div>
              <Text fw={600} size="lg" mb="md">
                {tc("createFlashSale")}
              </Text>
              <FlashSaleForm
                onSubmit={handleCreate}
                onClose={() => setCreateModalOpen(false)}
                isLoading={createMutation.isPending}
              />
            </div>
          }
          size="md"
        />

        {/* Edit Modal */}
        <CommonModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedFlashSale(null);
          }}
          content={
            selectedFlashSale && (
              <div>
                <Text fw={600} size="lg" mb="md">
                  {tc("editFlashSale")}
                </Text>
                <FlashSaleForm
                  flashSale={selectedFlashSale}
                  onSubmit={handleUpdate}
                  onClose={() => {
                    setEditModalOpen(false);
                    setSelectedFlashSale(null);
                  }}
                  isLoading={updateMutation.isPending}
                />
              </div>
            )
          }
                  size="md"
        />

        {/* Delete Modal */}
        <DeleteModal
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedFlashSale(null);
          }}
          onConfirm={confirmDelete}
          title={tc("deleteFlashSale")}
          message={
            selectedFlashSale
              ? `${tc("areYouSureDeleteFlashSaleGeneric")} "${selectedFlashSale.name}"?`
              : tc("areYouSureDeleteFlashSaleGeneric")
          }
          confirmButtonText={tc("delete")}
          cancelButtonText={tc("cancel")}
        />

        {/* Promotion Overlap Modal */}
        <CommonModal
          opened={promotionModalOpened}
          onClose={closePromotionModal}
          content={
            promotionOverlap && (
              <div className="p-6 flex flex-col items-center">
                <h2 className="text-xl font-semibold text-[#343a40] mb-4 text-center">
                  {tc('promotionOverlapTitle') || 'Happy Hour Conflict'}
                </h2>

                {promotionOverlap.existingPromotions && promotionOverlap.existingPromotions.length > 0 && (
                  <div className="w-full mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Text size="sm" c="dimmed" mb="xs" fw={500}>
                      {tc('activeHappyHours') || 'Active Happy Hours'}
                    </Text>
                    {promotionOverlap.existingPromotions.map((promo, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-1">
                        <Text size="sm" fw={500}>{promo.name} ({promo.dayOfWeek})</Text>
                        <Text size="sm" c="dimmed">
                          {promo.discountPercentage}% {tc('off')}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-slate-600 mb-6 text-center">
                  {tc('applyBothDiscountsQuestion') || 'Apply both discounts during overlapping times?'}
                </p>

                <div className="w-full flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePromotionConfirm(false)}
                    loading={loadingButton === 'no' && (createMutation.isPending || updateMutation.isPending || toggleMutation.isPending)}
                    disabled={createMutation.isPending || updateMutation.isPending || toggleMutation.isPending}
                    className="!flex-1 !py-2 !rounded-lg !font-medium"
                  >
                    {tc('noOnlyHappyHour') || 'No, Only Happy Hour'}
                  </Button>
                  <Button
                    onClick={() => handlePromotionConfirm(true)}
                    loading={loadingButton === 'yes' && (createMutation.isPending || updateMutation.isPending || toggleMutation.isPending)}
                    disabled={createMutation.isPending || updateMutation.isPending || toggleMutation.isPending}
                    className="!flex-1 !py-2 !rounded-lg !font-medium !bg-[#343a40] hover:!bg-black"
                  >
                    {tc('yesApplyBoth') || 'Yes, Apply Both'}
                  </Button>
                </div>
              </div>
            )
          }
        />
      </div>
    </BatchTranslationLoader>
  );
};

export default FlashSale;
