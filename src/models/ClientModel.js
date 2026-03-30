class ClientModel {
  constructor(data = {}) {
    this.id = data.id || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.appointments = data.appointments || [];
    this.penalties = data.penalties || [];
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  hasUnpaidPenalties() {
    return this.penalties.some(penalty => !penalty.paid);
  }

  getTotalUnpaidPenaltyAmount() {
    return this.penalties
      .filter(penalty => !penalty.paid)
      .reduce((total, penalty) => total + penalty.amount, 0);
  }

  addPenalty(penalty) {
    this.penalties.push({
      id: `penalty-${Date.now()}`,
      amount: penalty.amount,
      date: new Date(),
      reason: penalty.reason || 'No-show',
      paid: false,
      appointmentId: penalty.appointmentId,
    });
  }

  markPenaltyAsPaid(penaltyId) {
    const penalty = this.penalties.find(p => p.id === penaltyId);
    if (penalty) {
      penalty.paid = true;
      penalty.paidDate = new Date();
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      penalties: this.penalties,
    };
  }
}

export default ClientModel; 