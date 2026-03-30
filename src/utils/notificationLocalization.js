export function localizeNotification(notification, tc) {
  const rawTitle = notification?.title || '';
  const rawMessage = notification?.message || '';
  const type = notification?.type || 'admin';
  const meta = notification?.metadata || notification?.meta || notification?.data || {};

  const matchBusiness = rawMessage.match(/Business\s\"([^\"]+)\"/i);
  const businessName = meta.businessName || (matchBusiness ? matchBusiness[1] : undefined);
  const matchSession = rawMessage.match(/\(ID:([^\)]+)\)/i);
  const sessionId = meta.sessionId || (matchSession ? matchSession[1].trim() : undefined);

  const lowerMsg = rawMessage.toLowerCase();

  // Utility: format a date string to Spanish long format if possible
  const formatSpanishDateText = (dateText) => {
    try {
      const d = new Date(dateText);
      if (!isNaN(d)) {
        return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      }
    } catch (_) {}
    const monthMap = {
      Jan: 'enero', Feb: 'febrero', Mar: 'marzo', Apr: 'abril', May: 'mayo', Jun: 'junio',
      Jul: 'julio', Aug: 'agosto', Sep: 'septiembre', Oct: 'octubre', Nov: 'noviembre', Dec: 'diciembre'
    };
    return (dateText || '').replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => monthMap[m] || m);
  };

  // Pattern-based localization for appointment creation events
  if (lowerMsg.includes('created appointment for') || lowerMsg.includes('scheduled appointment for') || lowerMsg.includes('appointment created for')) {
    // Example: "Barber created appointment for Javier Mendez Aguilar on Oct 21, 2025 at 13:30" or "Appointment created for ..."
    const match = rawMessage.match(/created\s+appointment\s+for\s+(.+?)\s+on\s+([^\n]+?)\s+at\s+(\d{1,2}:\d{2})/i)
                  || rawMessage.match(/scheduled\s+appointment\s+for\s+(.+?)\s+on\s+([^\n]+?)\s+at\s+(\d{1,2}:\d{2})/i)
                  || rawMessage.match(/appointment\s+created\s+for\s+(.+?)\s+on\s+([^\n]+?)\s+at\s+(\d{1,2}:\d{2})/i);
    
    // Use metadata first, then try to extract from message
    const clientName = meta.clientName || (match ? match[1].trim() : undefined);
    let dateText = meta.dateText || (match ? match[2].trim() : undefined);
    let timeText = meta.timeText || (match ? match[3].trim() : undefined);
    
    // If we don't have date/time from metadata or regex, try to extract from message more flexibly
    if (!dateText || !timeText) {
      const flexibleMatch = rawMessage.match(/on\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4})\s+at\s+(\d{1,2}:\d{2})/i);
      if (flexibleMatch) {
        dateText = dateText || flexibleMatch[1];
        timeText = timeText || flexibleMatch[2];
      }
    }

    // If we have clientName from metadata or extracted, use localization
    if (meta.clientName || clientName) {
      const spanishDate = dateText ? formatSpanishDateText(dateText) : (dateText || '—');
      
      // Get translation, fallback to English if key doesn't exist
      const titleKey = 'notif.appointmentCreatedTitle';
      const messageKey = 'notif.appointmentCreatedMessage';
      const translatedTitle = tc(titleKey);
      const translatedMessage = tc(messageKey, {
        clientName: clientName || meta.clientName || 'Unknown Client',
        date: spanishDate || dateText || '—',
        time: timeText || '—',
      });
      
      // If translation returns the key itself, use fallback
      return {
        title: (translatedTitle && translatedTitle !== titleKey) ? translatedTitle : 'Appointment Created',
        description: (translatedMessage && translatedMessage !== messageKey) ? translatedMessage : rawMessage,
        type,
      };
    }
  }

  // Pattern-based localization for subscription activation events
  if (lowerMsg.includes('subscription has been activated')) {
    const extractedBusinessName = meta.businessName || businessName;
    const extractedSubscriptionId = meta.subscriptionId || (matchSession ? matchSession[1].trim() : undefined);
    
    const titleKey = 'notif.subscriptionActivatedTitle';
    const messageKey = 'notif.subscriptionActivatedMessage';
    const translatedTitle = tc(titleKey);
    const translatedMessage = tc(messageKey, {
      businessName: extractedBusinessName || 'Business',
      subscriptionId: extractedSubscriptionId || '—',
    });
    
    return {
      title: (translatedTitle && translatedTitle !== titleKey) ? translatedTitle : 'Subscription Activated',
      description: (translatedMessage && translatedMessage !== messageKey) ? translatedMessage : rawMessage,
      type,
    };
  }

  // Pattern-based localization for credit purchase events
  if (lowerMsg.includes('initiated a credit purchase checkout session')) {
    // Extract businessName from metadata or message
    const extractedBusinessName = meta.businessName || businessName;
    // Extract sessionId from metadata or message
    const extractedSessionId = meta.sessionId || sessionId;
    
    // Get translation, fallback to English if key doesn't exist
    const titleKey = 'notif.creditPurchaseInitiatedTitle';
    const messageKey = 'notif.creditPurchaseInitiatedMessage';
    const translatedTitle = tc(titleKey);
    const translatedMessage = tc(messageKey, {
      businessName: extractedBusinessName || 'Business',
      sessionId: extractedSessionId || '—',
    });
    
    // If translation returns the key itself, use fallback
    return {
      title: (translatedTitle && translatedTitle !== titleKey) ? translatedTitle : 'Credit Purchase Initiated',
      description: (translatedMessage && translatedMessage !== messageKey) ? translatedMessage : rawMessage,
      type,
    };
  }

  if (lowerMsg.includes('credit purchase succeeded') || lowerMsg.includes('completed a credit purchase')) {
    const extractedBusinessName = meta.businessName || businessName;
    
    const titleKey = 'notif.creditPurchaseSucceededTitle';
    const messageKey = 'notif.creditPurchaseSucceededMessage';
    const translatedTitle = tc(titleKey);
    const translatedMessage = tc(messageKey, {
      businessName: extractedBusinessName || 'Business',
    });
    
    return {
      title: (translatedTitle && translatedTitle !== titleKey) ? translatedTitle : 'Credit Purchase Completed',
      description: (translatedMessage && translatedMessage !== messageKey) ? translatedMessage : rawMessage,
      type,
    };
  }

  if (lowerMsg.includes('credit purchase failed') || lowerMsg.includes('failed to complete the credit purchase')) {
    const reasonMatch = rawMessage.match(/reason:([^\)]*)/i);
    const reason = meta.reason || (reasonMatch ? reasonMatch[1].trim() : '');
    const extractedBusinessName = meta.businessName || businessName;
    
    const titleKey = 'notif.creditPurchaseFailedTitle';
    const messageKey = 'notif.creditPurchaseFailedMessage';
    const translatedTitle = tc(titleKey);
    const translatedMessage = tc(messageKey, {
      businessName: extractedBusinessName || 'Business',
      reason: reason || 'Unknown error',
    });
    
    return {
      title: (translatedTitle && translatedTitle !== titleKey) ? translatedTitle : 'Credit Purchase Failed',
      description: (translatedMessage && translatedMessage !== messageKey) ? translatedMessage : rawMessage,
      type,
    };
  }

  // Generic fallback: try translating title or message as keys; else use raw text
  // Only translate if the result is different from the input (meaning translation exists)
  const titleTranslation = rawTitle ? tc(rawTitle) : null;
  const messageTranslation = rawMessage ? tc(rawMessage) : null;
  
  // Use translation only if it's different from the input (translation exists)
  // Otherwise use the raw text to avoid showing translation keys
  const translatedTitle = (titleTranslation && titleTranslation !== rawTitle) 
    ? titleTranslation 
    : (rawTitle || tc('notification') || 'Notification');
  
  const translatedMessage = (messageTranslation && messageTranslation !== rawMessage)
    ? messageTranslation
    : rawMessage;
  
  return { title: translatedTitle, description: translatedMessage, type };
}