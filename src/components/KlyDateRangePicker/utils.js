class now extends Date {
  constructor() {
    super(...arguments);
  }

  startOfDay() {
    this.setHours(0, 0, 0);
    return this;
  }

  endOfDay() {
    this.setHours(23, 59, 59);
    return this;
  }

  startOfMonth() {
    this.setDate(new now(this.getFullYear(), this.getMonth(), 1).getDate());
    return this.startOfDay();
  }

  endOfMonth() {
    this.setDate(new now(this.getFullYear(), this.getMonth() + 1, 0).getDate());
    return this.endOfDay();
  }

  subDays(days) {
    this.setDate(this.getDate() - days);
    return this;
  }

  subMonths(months) {
    this.setMonth(this.getMonth() - months);
    return this;
  }
}

export { now };
