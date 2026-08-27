# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


3715 7854 5365 4596



import React, { useState, useEffect } from "react";
import { useTeller } from "../hooks/useTeller";
import type { CustomerProfile } from "../types/customer.types";
import type { ActiveTellerModal } from "../types/tellerUI.types";
import { TellerSidebar, SidebarTab } from "../components/teller/TellerSidebar";
import { CustomersTab } from "../components/teller/CustomersTab";
import { TellerKYCQueue } from "../components/teller/TellerKYCQueue";
import { GlobalStatementsTeller } from "../components/statements/GlobalStatements.teller";

// Modals
import { CustomerOnboardTeller } from "../components/customer/CustomerOnboard.teller";
import { CreateAccountModalTeller } from "../components/account/CreateAccountModal.teller";
import { CashActionModalTeller } from "../components/teller/CashActionModal.teller";
import { LoanGrantTeller } from "../components/loan/LoanGrant.teller";
import { PayEMIModalTeller } from "../components/loan/PayEMIModal";
import { CustomerDetailsModal } from "../components/dashboard/CustomerDetailsModal";
import { AdminEditCustomerModal } from "../components/admin/AdminEditCustomerModal";
