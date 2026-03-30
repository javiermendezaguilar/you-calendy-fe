import React, { useState, useEffect } from 'react';
import { Menu, Button } from "@mantine/core";
import { IoMdMore, IoMdNotificationsOutline } from "react-icons/io";
import { ChevronLeft, ChevronRight } from 'tabler-icons-react';
import SuggestionModalContent from '../../common/SuggestionModalContent';
import CommonModal from '../../common/CommonModal';
import haircut from "../../../assets/haircut.webp";
import { useBatchTranslation } from '../../../contexts/BatchTranslationContext';

const CustomCalendar = ({
  selectedDate,
  events,
  onMarkAsCompleted,
  onMarkAsNoShow
}) => {
  const { tc } = useBatchTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [startHour, setStartHour] = useState(11);
  const [endHour, setEndHour] = useState(19);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Generate dynamic time slots based on startHour and endHour
  const timeSlots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Navigation functions
  const canNavigateLeft = startHour > 0;
  const canNavigateRight = endHour < 23;

  const navigateLeft = () => {
    if (canNavigateLeft) {
      setStartHour(prev => Math.max(0, prev - 1));
      setEndHour(prev => Math.max(1, prev - 1));
    }
  };

  const navigateRight = () => {
    if (canNavigateRight) {
      setStartHour(prev => Math.min(22, prev + 1));
      setEndHour(prev => Math.min(23, prev + 1));
    }
  };

  const renderEvent = (event) => {
    const { status, type, staffName, serviceName, clientRegistrationStatus, clientIncidentNotes } = event.extendedProps;

    // Check if menu should be hidden (completed or missed appointments)
    const shouldHideMenu = status?.toLowerCase() === "completed" || status?.toLowerCase() === "missed";

    // Check if client has no-show history
    const hasNoShowHistory = clientIncidentNotes && clientIncidentNotes.length > 0 && 
      clientIncidentNotes.some(n => n.type === 'no-show');

    const clientInfo = {
      title: event.title,
      clientId: event.extendedProps.clientId,
      appointmentId: event.extendedProps.appointmentId,
      incidentNotes: event.extendedProps.clientIncidentNotes,
      serviceName: event.extendedProps.serviceName,
      registrationStatus: event.extendedProps.clientRegistrationStatus
    };

    // Get all appointment information
    const promotion = event.extendedProps.promotion || { applied: false, originalPrice: 0, discountAmount: 0, discountPercentage: 0 };
    const flashSale = event.extendedProps.flashSale || { applied: false, originalPrice: 0, discountAmount: 0, discountPercentage: 0 };
    const penalty = event.extendedProps.penalty || { applied: false, amount: 0, paid: false };
    const delay = event.extendedProps.delay || { notified: false, message: '', newDate: null, newStartTime: null };
    const price = event.extendedProps.price || 0;
    const paymentStatus = event.extendedProps.paymentStatus || 'Pending';

    // Determine which discount(s) to display
    // If both are applied, show both (promotion first, then flash sale)
    let discountInfo = null;
    let originalPrice = null;
    let finalPrice = price;

    if (promotion.applied && flashSale.applied) {
      // Both discounts applied - show both
      originalPrice = promotion.originalPrice || (price + promotion.discountAmount + flashSale.discountAmount);
      discountInfo = {
        type: 'both',
        promotion: {
          amount: promotion.discountAmount,
          percentage: promotion.discountPercentage
        },
        flashSale: {
          amount: flashSale.discountAmount,
          percentage: flashSale.discountPercentage
        },
        originalPrice: originalPrice
      };
      finalPrice = price; // Final price is already calculated by backend
    } else if (flashSale.applied) {
      // Only flash sale applied
      originalPrice = flashSale.originalPrice || (price + flashSale.discountAmount);
      discountInfo = {
        type: 'flashSale',
        amount: flashSale.discountAmount,
        percentage: flashSale.discountPercentage,
        originalPrice: originalPrice
      };
      finalPrice = price;
    } else if (promotion.applied) {
      // Only promotion applied
      originalPrice = promotion.originalPrice || (price + promotion.discountAmount);
      discountInfo = {
        type: 'promotion',
        amount: promotion.discountAmount,
        percentage: promotion.discountPercentage,
        originalPrice: originalPrice
      };
      finalPrice = price;
    }

    // Collect all active/applied information to display
    const activeInfo = {
      hasDiscount: !!discountInfo,
      hasPenalty: penalty.applied && penalty.amount > 0,
      hasDelay: delay.notified,
      hasPaymentInfo: paymentStatus && paymentStatus !== 'Pending'
    };

    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    const timeDisplay = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    const durationMs = endTime - startTime;
    const durationMins = Math.floor(durationMs / (1000 * 60));

    // Calculate layout strategy based on duration
    const getLayoutStrategy = (durationMins) => {
      if (durationMins <= 15) {
        // Very short appointments - use horizontal compact layout
        return {
          layout: "horizontal",
          container: "p-1.5",
          showEndTime: false,
          showServiceType: true, // Always show service and staff
          showDuration: true,
          iconSize: 12,
          menuIconSize: 12,
          notificationIconSize: 10,
          borderWidth: "border-l-2",
          clientNameSize: "text-xs",
          timeSize: "text-xs",
          serviceSize: "text-[10px]",
          durationSize: "text-xs",
          statusSize: "text-[10px]",
          statusPadding: "px-1 py-0.5"
        };
      } else if (durationMins <= 30) {
        // Short appointments (16-30 min) - use vertical compact layout with smaller fonts
        return {
          layout: "vertical-compact",
          container: "p-2",
          showEndTime: true,
          showServiceType: true,
          showDuration: true,
          iconSize: 14,
          menuIconSize: 14,
          notificationIconSize: 12,
          borderWidth: "border-l-2",
          clientNameSize: "text-xs",
          timeSize: "text-xs",
          serviceSize: "text-xs",
          durationSize: "text-xs",
          statusSize: "text-[10px]",
          statusPadding: "px-1.5 py-0.5"
        };
      } else if (durationMins <= 60) {
        // Medium appointments (31-60 min) - use vertical compact layout
        return {
          layout: "vertical-compact",
          container: "p-2.5",
          showEndTime: true,
          showServiceType: true,
          showDuration: true,
          iconSize: 16,
          menuIconSize: 16,
          notificationIconSize: 14,
          borderWidth: "border-l-2",
          clientNameSize: "text-sm",
          timeSize: "text-sm",
          serviceSize: "text-sm",
          durationSize: "text-xs",
          statusSize: "text-sm",
          statusPadding: "px-2 py-1"
        };
      } else {
        // Longer appointments (61+ min) - use full vertical layout
        return {
          layout: "vertical-full",
          container: "p-3",
          showEndTime: true,
          showServiceType: true,
          showDuration: true,
          iconSize: 18,
          menuIconSize: 18,
          notificationIconSize: 16,
          borderWidth: "border-l-2",
          clientNameSize: "text-sm",
          timeSize: "text-sm",
          serviceSize: "text-sm",
          durationSize: "text-xs",
          statusSize: "text-sm",
          statusPadding: "px-3 py-1.5"
        };
      }
    };

    const layoutStrategy = getLayoutStrategy(durationMins);

    const renderPopupMenu = () => (
      <Menu.Dropdown>
        <>
          <Menu.Item onClick={() => onMarkAsCompleted(clientInfo)}>{tc('completed')}</Menu.Item>
          <Menu.Item className="!text-red-700" onClick={() => onMarkAsNoShow(clientInfo)}>{tc('noShow')}</Menu.Item>
        </>
      </Menu.Dropdown>
    );

    // Render horizontal layout for very narrow cards
    if (layoutStrategy.layout === "horizontal") {
      return (
        <div
          className={`${layoutStrategy.container} w-full h-full flex flex-col overflow-hidden
          ${status === "pending"
              ? "bg-[#FFECCE]"
              : status === "no-show"
                ? "bg-[#FFCECE]"
                : "bg-[#E1FFDC]"
            }
        `}
        >
          {/* Top row - Icons and Client name in same row */}
          <div className="flex items-start justify-between mb-0.5 flex-shrink-0">
            {/* Client name with border */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className={`${layoutStrategy.borderWidth} ${status === "pending"
                ? "border-yellow-700"
                : status === "no-show"
                  ? "border-[#970000]"
                  : "border-green-700"
                } h-4 flex-shrink-0`} />
              {/* Client type indicator */}
              <span className="flex-shrink-0" title={clientRegistrationStatus === 'registered' ? tc('appUser') : tc('walkInOrPhone')}>
                {clientRegistrationStatus === 'registered' ? '📱' : '📞'}
              </span>
              {/* No-show warning indicator */}
              {hasNoShowHistory && (
                <span className="flex-shrink-0 text-red-600" title={tc('hasNoShowHistory')}>⚠️</span>
              )}
              <p className={`font-semibold text-slate-900 ${layoutStrategy.clientNameSize} font-['Outfit',Helvetica] leading-tight truncate`} title={event.title}>
                {event.title}
              </p>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <div className="relative">
                <IoMdNotificationsOutline
                  className="cursor-pointer hover:scale-110 transform transition-transform"
                  size={layoutStrategy.notificationIconSize}
                  color="#000"
                  onClick={() => {
                    const notes = (event.extendedProps?.notes || '').trim();
                    const referencePhotos = Array.isArray(event.extendedProps?.referencePhotos) ? event.extendedProps.referencePhotos : [];
                    const firstPhotoUrl = referencePhotos[0]?.url;
                    const hasContent = notes.length > 0 || referencePhotos.length > 0;
                    setSelectedSuggestion({
                      id: event.id || Math.random().toString(36).substr(2, 9),
                      title: event.title,
                      description: tc('clientHasGivenSuggestion'),
                      type: 'suggestion',
                      isRead: false,
                      image: firstPhotoUrl || undefined,
                      suggestionDetails: {
                        message: hasContent ? (notes || '') : tc('noSuggestionsAvailable')
                      },
                      allPhotos: referencePhotos
                    });
                    setShowSuggestionModal(true);
                  }}
                />
                {event.extendedProps.hasNote && (
                  <span className="absolute -top-0.5 -right-0.5 block h-1 w-1 rounded-full bg-red-500 border border-white" />
                )}
              </div>

              {!shouldHideMenu && (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <button className="cursor-pointer p-0.5 rounded-full hover:bg-gray-400/20">
                      <IoMdMore color="#000000" size={layoutStrategy.menuIconSize} />
                    </button>
                  </Menu.Target>
                  {renderPopupMenu()}
                </Menu>
              )}
            </div>
          </div>

          {/* Bottom row - Time, discounts, and status */}
          <div className="flex flex-col gap-0.5 mt-auto flex-shrink-0">
            {/* Service and Staff name */}
            {layoutStrategy.showServiceType && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={`font-medium text-slate-900 ${layoutStrategy.serviceSize} font-['Outfit',Helvetica] truncate`} title={serviceName || type}>
                  {serviceName || type}
                </p>
                {staffName && (
                  <p className={`text-slate-500 ${layoutStrategy.durationSize} font-['Outfit',Helvetica] truncate`} title={staffName}>
                    👤 {staffName}
                  </p>
                )}
              </div>
            )}

            {/* Time and duration */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`font-medium text-slate-500 ${layoutStrategy.timeSize} font-['Outfit',Helvetica] truncate`}>
                {startTime.getHours()}:{startTime.getMinutes().toString().padStart(2, '0')}
              </p>
              <p className={`${layoutStrategy.durationSize} text-slate-500 font-['Outfit',Helvetica]`}>
                {durationMins}{tc('min')}
              </p>
            </div>

            {/* Applied information badges */}
            {(activeInfo.hasDiscount || activeInfo.hasPenalty || activeInfo.hasDelay || activeInfo.hasPaymentInfo) && (
              <div className="flex items-center gap-1 flex-wrap">
                {discountInfo && discountInfo.type === 'both' ? (
                  <>
                    <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`Promotion: ${discountInfo.promotion.percentage}% off`}>
                      🎁 -{discountInfo.promotion.percentage}%
                    </span>
                    <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`Flash Sale: ${discountInfo.flashSale.percentage}% off`}>
                      ⚡ -{discountInfo.flashSale.percentage}%
                    </span>
                  </>
                ) : discountInfo && (
                  <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${discountInfo.type === 'flashSale' ? tc('flashSale') : tc('promotion')}: ${discountInfo.percentage}% ${tc('off')} ($${originalPrice?.toFixed(2)} → $${finalPrice.toFixed(2)})`}>
                    {discountInfo.type === 'flashSale' ? '⚡' : '🎁'} -{discountInfo.percentage}%
                  </span>
                )}
                {activeInfo.hasPenalty && (
                  <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-red-100 text-red-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${tc('penalty')}: $${penalty.amount.toFixed(2)} ${penalty.paid ? '(' + tc('paid') + ')' : '(' + tc('unpaid') + ')'}`}>
                    ⚠️ ${penalty.amount.toFixed(2)}
                  </span>
                )}
                {activeInfo.hasDelay && (
                  <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${tc('delay')}: ${delay.message || tc('clientNotifiedOfDelay')}`}>
                    ⏰ {tc('delay')}
                  </span>
                )}
                {activeInfo.hasPaymentInfo && (
                  <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} font-semibold font-['Outfit',Helvetica] truncate`}>
                    💳 {paymentStatus === 'Paid' ? tc('paid') : paymentStatus}
                  </span>
                )}
              </div>
            )}

            {/* Status badge */}
            <div className="flex items-center gap-1 w-full">
              <div className={`${layoutStrategy.statusSize} ${layoutStrategy.statusPadding} rounded-md inline-flex items-center gap-1 flex-shrink-0 ${status === "pending"
                ? "bg-yellow-200 text-yellow-600"
                : status === "no-show"
                  ? "bg-[#eea3a3] text-[#970000]"
                  : "bg-green-200 text-green-600"
                }`}>
                <span className={`w-1 h-1 rounded-full ${status === "pending"
                  ? "bg-yellow-600"
                  : status === "no-show"
                    ? "bg-[#970000]"
                    : "bg-green-600"
                  }`} />
                <span className={`capitalize font-['Outfit',Helvetica] font-medium ${layoutStrategy.statusSize} truncate`}>
                  {tc(status)}
                </span>
              </div>
            </div>
            {/* Price display - always show, on next line */}
            <div className="flex items-center gap-0.5 w-full justify-end">
              {discountInfo ? (
                <>
                  <span className={`${layoutStrategy.durationSize} text-slate-400 line-through font-['Outfit',Helvetica] whitespace-nowrap`}>
                    ${originalPrice?.toFixed(2)}
                  </span>
                  <span className={`${layoutStrategy.durationSize} text-green-600 font-bold font-['Outfit',Helvetica] whitespace-nowrap`}>
                    ${finalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className={`${layoutStrategy.durationSize} text-slate-700 font-semibold font-['Outfit',Helvetica] whitespace-nowrap`}>
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Render vertical layouts for wider cards
    return (
      <div
        className={`${layoutStrategy.container} w-full h-full flex flex-col overflow-hidden
          ${status === "pending"
            ? "bg-[#FFECCE]"
            : status === "no-show"
              ? "bg-[#FFCECE]"
              : "bg-[#E1FFDC]"
          }
        `}
      >
        {/* Top row - Icons and Client name in same row */}
        <div className="flex items-start justify-between mb-1 flex-shrink-0">
          {/* Client name with border */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div className={`${layoutStrategy.borderWidth} ${status === "pending"
              ? "border-yellow-700"
              : status === "no-show"
                ? "border-[#970000]"
                : "border-green-700"
              } h-5 flex-shrink-0`} />
            {/* Client type indicator */}
            <span className="flex-shrink-0" title={clientRegistrationStatus === 'registered' ? tc('appUser') : tc('walkInOrPhone')}>
              {clientRegistrationStatus === 'registered' ? '📱' : '📞'}
            </span>
            {/* No-show warning indicator */}
            {hasNoShowHistory && (
              <span className="flex-shrink-0 text-red-600" title={tc('hasNoShowHistoryTooltip')}>⚠️</span>
            )}
            <p className={`font-semibold text-slate-900 ${layoutStrategy.clientNameSize} font-['Outfit',Helvetica] leading-tight truncate`} title={event.title}>
              {event.title}
            </p>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <div className="relative">
              <IoMdNotificationsOutline
                className="cursor-pointer hover:scale-110 transform transition-transform"
                size={layoutStrategy.notificationIconSize}
                color="#000"
                onClick={() => {
                  const notes = (event.extendedProps?.notes || '').trim();
                  const referencePhotos = Array.isArray(event.extendedProps?.referencePhotos) ? event.extendedProps.referencePhotos : [];
                  const firstPhotoUrl = referencePhotos[0]?.url;
                  const hasContent = notes.length > 0 || referencePhotos.length > 0;
                  setSelectedSuggestion({
                    id: event.id || Math.random().toString(36).substr(2, 9),
                    title: event.title,
                    description: tc('clientHasGivenSuggestion'),
                    type: 'suggestion',
                    isRead: false,
                    image: firstPhotoUrl || undefined,
                    suggestionDetails: {
                      message: hasContent ? (notes || '') : tc('noSuggestionsAvailable')
                    },
                    allPhotos: referencePhotos
                  });
                  setShowSuggestionModal(true);
                }}
              />
              {event.extendedProps.hasNote && (
                <span className="absolute -top-0.5 -right-0.5 block h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
              )}
            </div>

            {!shouldHideMenu && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <button className="cursor-pointer p-0.5 rounded-full hover:bg-gray-400/20 flex-shrink-0">
                    <IoMdMore color="#000000" size={layoutStrategy.menuIconSize} />
                  </button>
                </Menu.Target>
                {renderPopupMenu()}
              </Menu>
            )}
          </div>
        </div>

        {/* Time and service details */}
        <div
          className={`px-1.5 flex ${layoutStrategy.layout === "vertical-compact" ? 'flex-col gap-0.5' : 'justify-between items-start'} ${layoutStrategy.borderWidth} ${status === "pending"
            ? "border-yellow-700"
            : status === "no-show"
              ? "border-[#970000]"
              : "border-green-700"
            } flex-1 mb-0`}
        >
          <div className="flex flex-col">
            <p className={`font-medium text-slate-500 ${layoutStrategy.timeSize} font-['Outfit',Helvetica]`}>
              {timeDisplay}
            </p>
          </div>
          <div className={`${layoutStrategy.layout === "vertical-compact" ? 'flex justify-between items-center w-full' : 'flex flex-col items-end'}`}>
            <div className="flex flex-col">
              <p className={`font-medium mb-0 text-slate-900 ${layoutStrategy.serviceSize} font-['Outfit',Helvetica] truncate`} title={serviceName || type}>
                {serviceName || type}
              </p>
              {staffName && (
                <p className={`text-slate-500 ${layoutStrategy.durationSize} font-['Outfit',Helvetica] truncate`} title={staffName}>
                  👤 {staffName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <p className={`${layoutStrategy.durationSize} text-slate-500 font-['Outfit',Helvetica]`} data-translated="true">
                {durationMins}{tc('mins')}
              </p>
            </div>
          </div>
        </div>

        {/* Applied information badges */}
        {(activeInfo.hasDiscount || activeInfo.hasPenalty || activeInfo.hasDelay || activeInfo.hasPaymentInfo) && (
          <div className="flex items-center gap-1 flex-wrap mb-0.5 flex-shrink-0">
            {discountInfo && discountInfo.type === 'both' ? (
              <>
                <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`Promotion: ${discountInfo.promotion.percentage}% off`}>
                  🎁 -{discountInfo.promotion.percentage}%
                </span>
                <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`Flash Sale: ${discountInfo.flashSale.percentage}% off`}>
                  ⚡ -{discountInfo.flashSale.percentage}%
                </span>
              </>
            ) : discountInfo && (
              <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${discountInfo.type === 'flashSale' ? tc('flashSale') : tc('promotion')}: ${discountInfo.percentage}% ${tc('off')} ($${originalPrice?.toFixed(2)} → $${finalPrice.toFixed(2)})`}>
                {discountInfo.type === 'flashSale' ? '⚡' : '🎁'} -{discountInfo.percentage}%
              </span>
            )}
            {activeInfo.hasPenalty && (
              <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-red-100 text-red-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${tc('penalty')}: $${penalty.amount.toFixed(2)} ${penalty.paid ? '(' + tc('paid') + ')' : '(' + tc('unpaid') + ')'}`}>
                ⚠️ ${penalty.amount.toFixed(2)}
              </span>
            )}
            {activeInfo.hasDelay && (
              <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold font-['Outfit',Helvetica] truncate`} title={`${tc('delay')}: ${delay.message || tc('clientNotifiedOfDelay')}`}>
                ⏰ {tc('delay')}
              </span>
            )}
            {activeInfo.hasPaymentInfo && (
              <span className={`${layoutStrategy.durationSize} px-1 py-0.5 rounded ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} font-semibold font-['Outfit',Helvetica] truncate`}>
                💳 {paymentStatus === 'Paid' ? tc('paid') : paymentStatus}
              </span>
            )}
          </div>
        )}

        {/* Status badge - always at bottom inside card */}
        <div className="flex-shrink-0 flex items-center gap-1 mt-auto w-full">
          <div
            className={`${layoutStrategy.statusSize} ${layoutStrategy.statusPadding} rounded-md inline-flex items-center gap-1 flex-shrink-0 ${status === "pending"
              ? "bg-yellow-200 text-yellow-600"
              : status === "no-show"
                ? "bg-[#eea3a3] text-[#970000]"
                : "bg-green-200 text-green-600"
              }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${status === "pending"
                ? "bg-yellow-600"
                : status === "no-show"
                  ? "bg-[#970000]"
                  : "bg-green-600"
                }`}
            />
            <span
              className={`capitalize font-['Outfit',Helvetica] font-medium ${layoutStrategy.statusSize} truncate`}
            >
              {tc(status)}
            </span>
          </div>
        </div>
        {/* Price display - always show, on next line */}
        <div className="flex-shrink-0 flex items-center gap-0.5 w-full justify-end">
          {discountInfo ? (
            <>
              <span className={`${layoutStrategy.durationSize} text-slate-400 line-through font-['Outfit',Helvetica] whitespace-nowrap`}>
                ${originalPrice?.toFixed(2)}
              </span>
              <span className={`${layoutStrategy.durationSize} text-green-600 font-bold font-['Outfit',Helvetica] whitespace-nowrap`}>
                ${finalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className={`${layoutStrategy.durationSize} text-slate-700 font-semibold font-['Outfit',Helvetica] whitespace-nowrap`}>
              ${price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const formatDateLabel = (date) => {
    return dayjs(date).format('D-MMMM-YYYY');
  };

  // Helper function to group events by hour and assign sequential box positions
  const calculateEventPositions = (events) => {
    if (!events || events.length === 0) return { positionedEvents: [], maxBoxesPerHour: 3 };

    // Filter events within visible time range
    const visibleEvents = events.filter(event => {
      if (!event || !event.start || !event.end) {
        return false;
      }

      const startTime = new Date(event.start);
      const endTime = new Date(event.end);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return false;
      }

      const eventStartHour = startTime.getHours();
      const eventEndHour = endTime.getHours();

      // Include events that fall within visible time range
      return eventEndHour >= startHour && eventStartHour <= endHour;
    });

    // Group events by hour
    const eventsByHour = {};

    visibleEvents.forEach((event) => {
      const startTime = new Date(event.start);
      const eventHour = startTime.getHours();

      // Only process events within visible range
      if (eventHour >= startHour && eventHour <= endHour) {
        if (!eventsByHour[eventHour]) {
          eventsByHour[eventHour] = [];
        }
        eventsByHour[eventHour].push(event);
      }
    });

    // Sort events within each hour by start time
    Object.keys(eventsByHour).forEach(hour => {
      eventsByHour[hour].sort((a, b) => {
        const aTime = new Date(a.start);
        const bTime = new Date(b.start);
        return aTime - bTime;
      });
    });

    // Assign box positions sequentially within each hour
    const positionedEvents = [];
    let maxBoxesPerHour = 3; // Default minimum

    Object.keys(eventsByHour).forEach(hour => {
      const hourEvents = eventsByHour[hour];
      const hourNum = parseInt(hour);
      const hourOffset = hourNum - startHour;

      // Update max boxes if this hour has more events
      maxBoxesPerHour = Math.max(maxBoxesPerHour, hourEvents.length);

      hourEvents.forEach((event, boxIndex) => {
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);

        positionedEvents.push({
          event,
          hourOffset,
          boxIndex, // Sequential box position (0, 1, 2, 3, ...)
          startTime,
          endTime
        });
      });
    });

    return { positionedEvents, maxBoxesPerHour };
  };

  const renderMobileView = () => {
    const { positionedEvents, maxBoxesPerHour } = calculateEventPositions(events);
    const containerHeight = 600;
    const numBoxes = Math.max(maxBoxesPerHour, 3);
    const boxHeight = Math.floor(containerHeight / numBoxes);

    return (
      <div className="border border-gray-200 rounded">
        <div className="overflow-x-auto">
          <div className="grid border-b min-w-[1300px] relative" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
            {/* Left Navigation Arrow */}
            <button
              onClick={navigateLeft}
              disabled={!canNavigateLeft}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors ${!canNavigateLeft ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              <ChevronLeft size={20} />
            </button>
            {/* Right Navigation Arrow */}
            <button
              onClick={navigateRight}
              disabled={!canNavigateRight}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors ${!canNavigateRight ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              <ChevronRight size={20} />
            </button>
            {timeSlots.map((time) => (
              <div key={time} className="py-2 bg-[#2A2A2A] text-white font-medium text-center border-r border-gray-700 text-xs font-['Outfit',Helvetica]">
                {time}
              </div>
            ))}
          </div>

          <div className="relative min-w-[1300px]" style={{ height: `${containerHeight}px`, minHeight: '400px' }}>
            <div className="absolute w-full h-full">
              <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
                {timeSlots.map((time, i) => (
                  <div key={`col-${i}`} className="h-full border-r border-dashed border-gray-300 relative">
                    {[...Array(Math.max(numBoxes - 1, 2))].map((_, j) => (
                      <div
                        key={`line-${i}-${j}`}
                        className="absolute w-full border-b border-dashed border-gray-300"
                        style={{ top: `${(j + 1) * boxHeight}px` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {positionedEvents.map(({ event, hourOffset, boxIndex }) => {
              const { status } = event.extendedProps || { status: "pending" };

              // Calculate column position (full width of the hour column)
              const columnWidth = 100 / timeSlots.length;
              const leftPercent = (hourOffset * columnWidth);

              return (
                <div
                  key={`event-${event.id}-${hourOffset}-${boxIndex}`}
                  className="absolute border border-gray-200 rounded-md shadow-sm overflow-hidden"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${columnWidth}%`,
                    top: `${boxIndex * boxHeight + 2}px`,
                    height: `${boxHeight - 4}px`,
                    zIndex: 10 + boxIndex,
                    padding: '2px',
                  }}
                >
                  <div className="h-full w-full overflow-hidden">
                    {renderEvent(event)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopView = () => {
    const { positionedEvents, maxBoxesPerHour } = calculateEventPositions(events);
    const containerHeight = 480;
    const numBoxes = Math.max(maxBoxesPerHour, 3);
    const boxHeight = Math.floor(containerHeight / numBoxes);

    return (
      <div className="border border-gray-200 rounded">
        <div className="grid border-b relative" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
          {/* Left Navigation Arrow */}
          <button
            onClick={navigateLeft}
            disabled={!canNavigateLeft}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors ${!canNavigateLeft ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
          >
            <ChevronLeft size={24} />
          </button>
          {/* Right Navigation Arrow */}
          <button
            onClick={navigateRight}
            disabled={!canNavigateRight}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors ${!canNavigateRight ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
          >
            <ChevronRight size={24} />
          </button>
          {timeSlots.map((time) => (
            <div key={time} className="py-3 bg-[#2A2A2A] text-white font-medium text-center border-r border-gray-700 font-['Outfit',Helvetica]">
              {time}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: `${containerHeight}px`, minHeight: '400px' }}>
          <div className="absolute w-full h-full">
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
              {timeSlots.map((time, i) => (
                <div key={`col-${i}`} className="h-full border-r border-dashed border-gray-300 relative">
                  {[...Array(Math.max(maxBoxesPerHour - 1, 2))].map((_, j) => (
                    <div
                      key={`line-${i}-${j}`}
                      className="absolute w-full border-b border-dashed border-gray-300"
                      style={{ top: `${(j + 1) * boxHeight}px` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {positionedEvents.map(({ event, hourOffset, boxIndex }) => {
            const { status } = event.extendedProps || { status: "pending" };

            // Calculate column position (full width of the hour column)
            const columnWidth = 100 / timeSlots.length;
            const leftPercent = (hourOffset * columnWidth);

            return (
              <div
                key={`event-${event.id}-${hourOffset}-${boxIndex}`}
                className="absolute border border-gray-200 rounded-md shadow-sm overflow-hidden"
                style={{
                  left: `${leftPercent}%`,
                  width: `${columnWidth}%`,
                  top: `${boxIndex * boxHeight + 2}px`,
                  height: `${boxHeight - 4}px`,
                  zIndex: 10 + boxIndex
                }}
              >
                <div className="h-full w-full overflow-hidden">
                  {renderEvent(event)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {isMobile ? renderMobileView() : renderDesktopView()}
      <CommonModal
        opened={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        content={<SuggestionModalContent suggestion={selectedSuggestion} onClose={() => setShowSuggestionModal(false)} />}
        size='md'
        styles={{
          content: {
            borderRadius: '30px',
            border: '1px solid rgba(228, 233, 242, 0.5)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            padding: 0,
            overflow: 'visible',
            position: 'relative'
          },
          body: {
            overflow: 'visible'
          },
          inner: {
            overflow: 'visible'
          }
        }}
      />
    </div>
  );
};

export default CustomCalendar;