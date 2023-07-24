import { CreateCustomer, CreateCustomerRequest, Customer } from "../types/CustomerTypes";

export const deserializeCustomer = (response: any): Customer => {
    return {
        id: response.data.id,
        username: response.data.user.username,
        first_name: response.data.user.first_name,
        last_name: response.data.user.last_name,
        email: response.data.user.email,
        date_joined: response.data.user.date_joined,
        max_reservations: response.data.max_reservations,
        current_reservations: response.data.current_reservations,
        mailing_address: response.data.mailing_address,
    };
};

export const serializeCustomerCreate = (customer: CreateCustomer): CreateCustomerRequest => {
    return {
        user: {
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            username: customer.username,
            password: customer.password,
        },
        mailing_address: customer.mailing_address,
    };
}