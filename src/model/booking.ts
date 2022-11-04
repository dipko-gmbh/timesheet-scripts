export interface Booking {
    id: string;
    _className: string;
    bookingDay: {
        /** the date in format YYYYMMDD */
        id: string;
        timeBookings: TimeBooking[];

    }
};

export interface TimeBooking {
    duration: string;
    projectBookings: ProjectBooking[];
}

export interface ProjectBooking {
    duration: string;
}