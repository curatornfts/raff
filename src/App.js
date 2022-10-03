import React, { lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { initialCrossword, WalletContext } from "./contexts/accounts";

import { Routes, Route } from "react-router-dom";
import Loadable from './utils/loadable'

import { Buffer } from "buffer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = Loadable(lazy(() => import("./layout")));

const DiscordLogin = Loadable(lazy(() => import("./pages/login")));
const Raffle = Loadable(lazy(() => import("./pages/raffle")));
const Account = Loadable(lazy(() => import("./pages/account")))
const CreateNewRaffle = Loadable(lazy(() => import("./pages/create")));
const Callback = Loadable(lazy(() => import("./pages/callback")));


// eslint-disable-next-line no-undef
globalThis.Buffer = Buffer;

export default function App() {
  const [wallet, setWallet] = useState(undefined);


  const init = useCallback(async () => {
    const wallet_ = await initialCrossword();
    setWallet(wallet_);
  }, []);

  useEffect(() => {
    init();
  }, [init]);



  return (
    <WalletContext.Provider value={wallet}>
      {/* <Suspense fallback={<Spinner />}> */}
      <Router>
        <Routes >
          <Route path="/" element={<DiscordLogin />} />
          <Route path="/login" element={<DiscordLogin />} />
          <Route path="/api/auth/callback" element={<Callback />} />
          <Route element={<Layout />}>
            <Route path="/raffles" element={<Raffle />} />
            <Route path="/create-new" element={<CreateNewRaffle />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
      {/* </Suspense> */}
    </WalletContext.Provider>
  );
}
