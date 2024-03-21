import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth } from "./components/login";
import { CreateAccount } from "./components/createAccount";
import { HomePage } from './components/HomePage';
import AdminInterface from './components/adminInterface';
import { ForgetPassword } from './components/forgetPassword';
import Email from './components/SendEmail/SendEmailPage';
import Search from './components/SearchMenu/SearchPage';

function App () {
  return (
      <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/create-account" element={<CreateAccount />} />  
                <Route path="/admin-interface" element={<AdminInterface />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/send-email" element={<Email />} />
                <Route path="/search-menu" element={<Search />} />
                {/* Add more routes for other pages as needed */}
            </Routes>
      </Router>
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