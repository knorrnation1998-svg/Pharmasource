export interface StaffAccount {
  email: string;
  name: string;
  role: string;
  hub: string;
  password: string;
}

export const authorizedStaff: Record<string, StaffAccount> = {
  "admin@keyanisupply.cm": {
    email: "admin@keyanisupply.cm",
    name: "Dr. Jean-Paul Keyani",
    role: "Logistics Manager",
    hub: "Douala Central",
    password: "##August2015",
  },
  "douala.dispatch@keyanisupply.cm": {
    email: "douala.dispatch@keyanisupply.cm",
    name: "Marie Ngono",
    role: "Warehouse Dispatcher",
    hub: "Douala Central",
    password: "##August2015",
  },
  "yaounde.coldchain@keyanisupply.cm": {
    email: "yaounde.coldchain@keyanisupply.cm",
    name: "Serge Atangana",
    role: "Cold-Chain Specialist",
    hub: "Yaoundé Express",
    password: "##August2015",
  },
};