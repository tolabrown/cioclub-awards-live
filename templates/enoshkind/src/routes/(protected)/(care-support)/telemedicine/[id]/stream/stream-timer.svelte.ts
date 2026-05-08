import type { iConsultation } from '$lib/interface';

export type StreamStatus = 'before' | 'during' | 'after';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * StreamTimer class to manage consultation timing
 * Determines if current time is before, during, or after the consultation
 */
export class StreamTimer {
  consultation: iConsultation;
  durationMinutes: number;
  currentStatus = $state<StreamStatus>('before');
  timeRemaining = $state<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  timeRemainingInSession = $state<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  private intervalId: number | null = null;
  private startDateTime: Date;
  private endDateTime: Date;

  constructor(consultation: iConsultation, durationMinutes: number) {
    this.consultation = consultation;
    this.durationMinutes = durationMinutes;

    // Combine appointment date and time to create start datetime
    this.startDateTime = this.parseAppointmentDateTime();

    // Calculate end datetime by adding duration
    this.endDateTime = new Date(this.startDateTime.getTime() + durationMinutes * 60 * 1000);

    // Initial status check
    this.updateStatus();

    // Start interval to update every second
    this.startTimer();
  }

  /**
   * Parse the appointment date and time into a Date object
   */
  private parseAppointmentDateTime(): Date {
    const appointmentDate = typeof this.consultation.appointmentDate === 'string'
      ? new Date(this.consultation.appointmentDate)
      : this.consultation.appointmentDate;

    // Handle time formats like "09:00 AM" or "14:00"
    const timeStr = this.consultation.appointmentTime;
    let hours = 0;
    let minutes = 0;

    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      // 12-hour format: "09:00 AM"
      const [time, period] = timeStr.split(' ');
      const [h, m] = time.split(':').map(Number);
      hours = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h);
      minutes = m;
    } else {
      // 24-hour format: "14:00"
      [hours, minutes] = timeStr.split(':').map(Number);
    }

    const result = new Date(appointmentDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Update the current status based on current time
   */
  private updateStatus(): void {
    const now = new Date();
    const gracePeriodMs = 10 * 60 * 1000;
    const effectiveStartTime = new Date(this.startDateTime.getTime() - gracePeriodMs);

    if (now < effectiveStartTime) {
      this.currentStatus = 'before';
      this.calculateTimeRemaining(now);
      this.timeRemainingInSession = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    } else if (now >= effectiveStartTime && now <= this.endDateTime) {
      this.currentStatus = 'during';
      // Still show time remaining to the ACTUAL start if we are in the grace period
      if (now < this.startDateTime) {
        this.calculateTimeRemaining(now);
      } else {
        this.timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      this.calculateTimeRemainingInSession(now);
    } else {
      this.currentStatus = 'after';
      this.timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      this.timeRemainingInSession = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  /**
   * Calculate time remaining until consultation starts
   */
  private calculateTimeRemaining(now: Date): void {
    const diff = this.startDateTime.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeRemaining = { days, hours, minutes, seconds };
  }

  /**
   * Calculate time remaining in current session
   */
  private calculateTimeRemainingInSession(now: Date): void {
    const diff = this.endDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      this.timeRemainingInSession = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeRemainingInSession = { days: 0, hours, minutes, seconds };
  }

  /**
   * Start the timer interval
   */
  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      this.updateStatus();
    }, 1000);
  }

  /**
   * Stop the timer interval
   */
  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get formatted start date and time
   */
  getFormattedStartTime(): string {
    return this.startDateTime.toLocaleString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get formatted end time
   */
  getFormattedEndTime(): string {
    return this.endDateTime.toLocaleString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
