import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export dashboard statistics to CSV format
 * @param {Object} data - The dashboard data to export
 * @param {string} filename - The filename for the exported file
 */
export const exportToCSV = (data, filename = 'admin-dashboard-stats') => {
  try {
    // Prepare the data for CSV export
    const csvData = [
      {
        'Metric': 'Monthly Appointments',
        'Value': data.monthlyAppointments || 0,
        'Export Date': new Date().toLocaleDateString()
      },
      {
        'Metric': 'Total Revenue',
        'Value': `$${(data.totalRevenue || 0).toLocaleString()}`,
        'Export Date': new Date().toLocaleDateString()
      },
      {
        'Metric': 'Total Barbers',
        'Value': data.totalBarbers || 0,
        'Export Date': new Date().toLocaleDateString()
      },
      {
        'Metric': 'Completion Rate',
        'Value': data.completionRate || 'N/A',
        'Export Date': new Date().toLocaleDateString()
      }
    ];

    // Add additional data if available
    if (data.trendsData && data.trendsData.length > 0) {
      csvData.push(
        { 'Metric': '', 'Value': '', 'Export Date': '' }, // Empty row
        { 'Metric': 'Monthly Trends', 'Value': '', 'Export Date': '' }
      );
      
      data.trendsData.forEach((trend, index) => {
        csvData.push({
          'Metric': `Month ${index + 1}`,
          'Value': trend.count || 0,
          'Export Date': trend.month || ''
        });
      });
    }

    // Convert to CSV
    const csv = Papa.unparse(csvData);
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};

/**
 * Export dashboard statistics to PDF format
 * @param {Object} data - The dashboard data to export
 * @param {string} filename - The filename for the exported file
 */
export const exportToPDF = async (data, filename = 'admin-dashboard-stats') => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Admin Dashboard Statistics', pageWidth / 2, 30, { align: 'center' });
    
    // Add export date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });
    
    // Add statistics
    let yPosition = 60;
    const lineHeight = 15;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Metrics:', 20, yPosition);
    yPosition += lineHeight;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const metrics = [
      { label: 'Monthly Appointments:', value: (data.monthlyAppointments || 0).toLocaleString() },
      { label: 'Total Revenue:', value: `$${(data.totalRevenue || 0).toLocaleString()}` },
      { label: 'Total Barbers:', value: (data.totalBarbers || 0).toLocaleString() },
      { label: 'Completion Rate:', value: data.completionRate || 'N/A' }
    ];
    
    metrics.forEach(metric => {
      pdf.text(`${metric.label}`, 25, yPosition);
      pdf.text(`${metric.value}`, 100, yPosition);
      yPosition += lineHeight;
    });
    
    // Add trends data if available
    if (data.trendsData && data.trendsData.length > 0) {
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Trends:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      data.trendsData.forEach((trend, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(`Month ${index + 1}:`, 25, yPosition);
        pdf.text(`${trend.count || 0} appointments`, 100, yPosition);
        yPosition += lineHeight;
      });
    }
    
    // Try to capture dashboard charts if the element exists
    const dashboardElement = document.querySelector('.admin-dashboard-content');
    if (dashboardElement) {
      try {
        const canvas = await html2canvas(dashboardElement, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add new page for charts
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dashboard Overview:', 20, 30);
        
        if (imgHeight < pageHeight - 50) {
          pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
        }
      } catch (canvasError) {
        console.warn('Could not capture dashboard charts:', canvasError);
      }
    }
    
    // Save the PDF
    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF file');
  }
};

/**
 * Prepare dashboard data for export
 * @param {Object} userStats - User statistics data
 * @param {Object} revenueData - Revenue data
 * @param {Object} trendsData - Trends data
 * @returns {Object} Formatted data for export
 */
export const prepareDashboardData = (userStats, revenueData, trendsData) => {
  const monthlyAppointments = trendsData?.data?.monthlyCounts?.reduce(
    (sum, month) => sum + (month.count || 0), 0
  ) || 0;
  
  const completionRate = revenueData?.data?.summary?.completionRate
    ? `${Math.round(revenueData.data.summary.completionRate)}%`
    : 'N/A';
  
  return {
    monthlyAppointments,
    totalRevenue: revenueData?.data?.totalRevenue || 0,
    totalBarbers: userStats?.data?.barbers?.total || 0,
    completionRate,
    trendsData: trendsData?.data?.monthlyCounts || []
  };
};