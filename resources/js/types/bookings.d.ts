import type { SharedData } from "./index";
import type { Event } from "./events";
import type { Venue } from "./venues";
import type { Performer } from "./performers";

/** Booking status types */
export const BOOKING_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    REJECTED: "rejected",
    REFUNDED: "refunded",
} as const;

export type BookingStatus =
    (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

/** Booking type discriminator */
export const BOOKING_TYPE = {
    EVENT: "event",
    VENUE: "venue",
    PERFORMER: "performer",
} as const;

export type BookingType = (typeof BOOKING_TYPE)[keyof typeof BOOKING_TYPE];

/** Payment status types */
export const PAYMENT_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    PARTIALLY_PAID: "partially_paid",
    FAILED: "failed",
    REFUNDED: "refunded",
    CANCELLED: "cancelled",
} as const;

export type PaymentStatus =
    (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/** Contact information for bookings */
export interface BookingContact {
    readonly name: string;
    readonly email: string;
    readonly phone?: string;
    readonly company?: string;
}

/** Payment information */
export interface BookingPayment {
    readonly status: PaymentStatus;
    readonly totalAmount: number;
    readonly currency: string;
    readonly paidAmount: number;
    readonly paymentMethod?: string;
    readonly transactionId?: string;
    readonly paymentDate?: string;
    readonly refundAmount?: number;
    readonly refundDate?: string;
}

/** Base booking interface */
export interface BaseBooking {
    readonly id: string;
    readonly bookingNumber: string;
    readonly status: BookingStatus;
    readonly bookingType: BookingType;
    readonly userId?: string;
    readonly contactInfo: BookingContact;
    readonly payment: BookingPayment;
    readonly notes?: string;
    readonly specialRequests?: readonly string[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly confirmedAt?: string;
    readonly cancelledAt?: string;
    readonly cancellationReason?: string;
}

/** Event ticket booking */
export interface EventBooking extends BaseBooking {
    readonly bookingType: typeof BOOKING_TYPE.EVENT;
    readonly eventId: string;
    readonly ticketQuantity: number;
    readonly ticketType: string;
    readonly pricePerTicket: number;
    readonly event?: Event;
}

/** Venue rental booking */
export interface VenueBooking extends BaseBooking {
    readonly bookingType: typeof BOOKING_TYPE.VENUE;
    readonly venueId: string;
    readonly eventDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly eventType: string;
    readonly expectedGuests: number;
    readonly setupRequirements?: readonly string[];
    readonly cateringRequirements?: readonly string[];
    readonly venue?: Venue;
}

/** Performer booking */
export interface PerformerBooking extends BaseBooking {
    readonly bookingType: typeof BOOKING_TYPE.PERFORMER;
    readonly performerId: string;
    readonly eventDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly eventType: "private" | "public" | "corporate";
    readonly venueId?: string;
    readonly expectedAudience: number;
    readonly performanceRequirements?: readonly string[];
    readonly soundRequirements?: readonly string[];
    readonly performer?: Performer;
    readonly venue?: Venue;
}

/** Union type for all booking types */
export type Booking = EventBooking | VenueBooking | PerformerBooking;

/** Booking filters */
export interface BookingFilters {
    readonly status?: BookingStatus;
    readonly bookingType?: BookingType;
    readonly dateRange?: {
        readonly from: string;
        readonly to: string;
    };
    readonly paymentStatus?: PaymentStatus;
    readonly userId?: string;
    readonly venueId?: string;
    readonly performerId?: string;
    readonly eventId?: string;
}

/** Booking summary/stats */
export interface BookingStats {
    readonly totalBookings: number;
    readonly pendingBookings: number;
    readonly confirmedBookings: number;
    readonly cancelledBookings: number;
    readonly totalRevenue: number;
    readonly averageBookingValue: number;
    readonly bookingsByType: {
        readonly events: number;
        readonly venues: number;
        readonly performers: number;
    };
    readonly bookingsByStatus: Record<BookingStatus, number>;
}

/** Page Props */
export interface BookingsPageProps extends SharedData {
    readonly bookings?: readonly Booking[];
    readonly bookingStats?: BookingStats;
    readonly filters?: BookingFilters;
}

export interface BookingDetailsProps extends SharedData {
    readonly booking: Booking;
    readonly relatedBookings?: readonly Booking[];
}

/** Booking actions */
export interface BookingActions {
    readonly onConfirm: (booking: Booking) => void;
    readonly onCancel: (booking: Booking, reason?: string) => void;
    readonly onRefund: (booking: Booking, amount?: number) => void;
    readonly onUpdate: (booking: Booking, updates: Partial<Booking>) => void;
    readonly onViewDetails: (booking: Booking) => void;
    readonly onDownloadInvoice?: (booking: Booking) => void;
}

/** Booking creation data */
export interface CreateEventBookingData {
    readonly eventId: string;
    readonly ticketQuantity: number;
    readonly ticketType: string;
    readonly contactInfo: BookingContact;
    readonly specialRequests?: readonly string[];
    readonly paymentMethod?: string;
}

export interface CreateVenueBookingData {
    readonly venueId: string;
    readonly eventDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly eventType: string;
    readonly expectedGuests: number;
    readonly contactInfo: BookingContact;
    readonly setupRequirements?: readonly string[];
    readonly cateringRequirements?: readonly string[];
    readonly specialRequests?: readonly string[];
    readonly notes?: string;
}

export interface CreatePerformerBookingData {
    readonly performerId: string;
    readonly eventDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly eventType: "private" | "public" | "corporate";
    readonly venueId?: string;
    readonly expectedAudience: number;
    readonly budget: number;
    readonly contactInfo: BookingContact;
    readonly performanceRequirements?: readonly string[];
    readonly soundRequirements?: readonly string[];
    readonly specialRequests?: readonly string[];
    readonly notes?: string;
}

/** Booking update data */
export interface UpdateBookingData {
    readonly id: string;
    readonly status?: BookingStatus;
    readonly notes?: string;
    readonly specialRequests?: readonly string[];
    readonly contactInfo?: Partial<BookingContact>;
    readonly cancellationReason?: string;
}

/** Booking availability check */
export interface BookingAvailabilityRequest {
    readonly resourceId: string; // venueId or performerId
    readonly resourceType: "venue" | "performer";
    readonly date: string;
    readonly startTime?: string;
    readonly endTime?: string;
}

export interface BookingAvailabilityResponse {
    readonly available: boolean;
    readonly conflicts?: readonly {
        readonly bookingId: string;
        readonly startTime: string;
        readonly endTime: string;
        readonly reason: string;
    }[];
    readonly suggestedAlternatives?: readonly {
        readonly date: string;
        readonly startTime: string;
        readonly endTime: string;
    }[];
}

/** Booking notification preferences */
export interface BookingNotificationPreferences {
    readonly emailConfirmation: boolean;
    readonly smsConfirmation: boolean;
    readonly reminderEmails: boolean;
    readonly reminderSms: boolean;
    readonly cancellationNotification: boolean;
    readonly paymentNotification: boolean;
}
