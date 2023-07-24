import { PropsWithChildren, createContext, useState } from 'react';
import { Customer } from '../types/CustomerTypes';
import React from 'react';

interface CustomerContextValue {
  customer: Customer | null;
  setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export const CustomerContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = () => {
  const customerContext = React.useContext(CustomerContext);
  if (customerContext === undefined) {
    throw new Error('useCustomerContext must be used within a CustomerContextProvider');
  }
  return customerContext;
};
