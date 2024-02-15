import logo from './logo.svg';
import './App.css';
import { Login } from "./components/login";
import {CreateAccount } from "./components/createAccount";
//names BrowserRouter as Router
//Routes are used to define all the Route
//Router is used to define where in your app you want to have access to react-router-dom stuff
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/*
            the single slash represents the path for the home page
            element is just a component that will be render when we go to this route which is the Login page for this case
          */}
          <Route path="/" element={<Login />}/>
          {/* this path means if I want to go to the CreateAccount page I just need to add /create-account to my route*/}
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="*" element={<h1> PAGE NOT FOUND </h1>} />
        </Routes>
      </Router>
      {/*<CreateAccount/>*/}
    </div>
  );
}

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

export default App;
