import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth } from "./components/login";
import { CreateAccount } from "./components/createAccount";
import { HomePage } from './components/HomePage';
import AdminInterface from './components/adminInterface';
import ChartOfAccountsPage from './components/ChartOfAccountsPage';
import JournalPage from './components/JournalPage';
import LedgerPage from './components/ledgerPage';
import { UserProvider } from "./components/userContext";
import { ForgetPassword } from './components/forgetPassword';
import Email from './components/SendEmail/SendEmailPage';
import StatementPage from "./components/statementPage";
import HelpPage from "./components/HelpPage";


function App () {
  return (
    <UserProvider>
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/create-account" element={<CreateAccount />} />  
                <Route path="/admin-interface" element={<AdminInterface />} />
                <Route path="/chart" element={<ChartOfAccountsPage />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/send-email" element={<Email />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/ledger-page" element={<LedgerPage />} />
                <Route path="/statements" element={<StatementPage />} />
                <Route path="/help" element={<HelpPage />} />
                {/* Add more routes for other pages as needed */}
            </Routes>
        </Router>
      </UserProvider>
  );
};

export default App;
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React VT WAS HERE!
//         </a>
//       </header>
//     </div>
//   );
// }