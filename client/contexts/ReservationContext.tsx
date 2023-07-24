import { PropsWithChildren, createContext, useState } from 'react';
import { Reservation } from '../types/ReservationTypes';
import React from 'react';

interface ReservationContextValue {
  reservations: Reservation[] | null;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[] | null>>;
}

const ReservationContext = createContext<ReservationContextValue | undefined>(undefined);

export const ReservationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[] | null>([]);

  return (
    <ReservationContext.Provider value={{ reservations, setReservations }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservationContext = () => {
  const reservationContext = React.useContext(ReservationContext);
  if (reservationContext === undefined) {
    throw new Error('useReservationContext must be used within a ReservationContextProvider');
  }
  return reservationContext;
};
