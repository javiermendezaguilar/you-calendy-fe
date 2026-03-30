import React, { useState } from 'react';
import { Button, Text, Group, Stack, Radio, NumberInput, Divider, Alert } from '@mantine/core';
import { IoCheckmarkCircleOutline, IoWarningOutline } from 'react-icons/io5';
import penaltyService from '../../../services/penaltyService';

const PayPenalty = ({ clientName, penalties, onPenaltyPaid, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState(null);
  
  const totalAmount = penalties.reduce((sum, penalty) => sum + penalty.amount, 0);
  
  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      for (const penalty of penalties) {
        await penaltyService.markPenaltyAsPaid(penalty.id);
      }
      
      setIsPaid(true);
      setIsProcessing(false);
      
      setTimeout(() => {
        onPenaltyPaid && onPenaltyPaid();
      }, 1500);
      
    } catch (error) {
      setError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };
  
  if (isPaid) {
    return (
      <div className="p-6 flex flex-col items-center">
        <IoCheckmarkCircleOutline size={64} className="text-green-500 mb-4" />
        <Text size="xl" fw={600} className="mb-2 text-center">
          Payment Successful!
        </Text>
        <Text size="md" className="text-slate-600 text-center mb-6">
          All penalties for {clientName} have been paid.
          You can now proceed with booking.
        </Text>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <Stack spacing="md">
        <div>
          <Text size="xl" fw={600} className="text-slate-800">
            Pay No-Show Penalties
          </Text>
          <Text size="sm" className="text-slate-500 mt-1">
            {clientName} has outstanding penalties that must be paid before booking.
          </Text>
        </div>
        
        {error && (
          <Alert 
            icon={<IoWarningOutline size={16} />} 
            title="Payment Error" 
            color="red"
            className="mt-2"
          >
            {error}
          </Alert>
        )}
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <Text fw={500} className="mb-2">Penalty Details</Text>
          
          {penalties.map((penalty, index) => (
            <div key={penalty.id} className="flex justify-between mb-2">
              <Text size="sm">
                No-show on {new Date(penalty.date).toLocaleDateString()}
              </Text>
              <Text fw={500}>${penalty.amount.toFixed(2)}</Text>
            </div>
          ))}
          
          <Divider my="sm" />
          
          <div className="flex justify-between">
            <Text fw={500}>Total Due</Text>
            <Text size="lg" fw={600} className="text-red-600">
              ${totalAmount.toFixed(2)}
            </Text>
          </div>
        </div>
        
        <div>
          <Text fw={500} className="mb-2">Payment Method</Text>
          <Radio.Group
            value={paymentMethod}
            onChange={setPaymentMethod}
          >
            <Group mt="xs">
              <Radio value="card" label="Credit Card" />
              <Radio value="cash" label="Cash" />
            </Group>
          </Radio.Group>
        </div>
        
        <div className="flex gap-3 mt-4 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            color="gray"
            size="md"
            radius="md"
            className="w-1/3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#323334] w-1/3"
            size="md"
            radius="md"
            loading={isProcessing}
          >
            Pay Now
          </Button>
        </div>
      </Stack>
    </div>
  );
};

export default PayPenalty; 