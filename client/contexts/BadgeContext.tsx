import { PropsWithChildren, createContext, useState } from 'react';
import React from 'react';

interface BadgeContextValue {
  badge: number | null;
  setBadge: React.Dispatch<React.SetStateAction<number | null>>;
  reservationsBadge: number | null;
  setReservationsBadge: React.Dispatch<React.SetStateAction<number | null>>;
}

const BadgeContext = createContext<BadgeContextValue | undefined>(undefined);

export const BadgeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [badge, setBadge] = useState<number | null>(null);
  const [reservationsBadge, setReservationsBadge] = useState<number | null>(null);

  return (
    <BadgeContext.Provider value={{ badge, setBadge, reservationsBadge, setReservationsBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => {
  const badgeContext = React.useContext(BadgeContext);
  if (badgeContext === undefined) {
    throw new Error('useBadgeContext must be used within a BadgeContextProvider');
  }
  return badgeContext;
};
