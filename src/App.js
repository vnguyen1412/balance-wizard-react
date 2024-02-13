import logo from './logo.svg';
import './App.css';
import { Auth } from "./components/login";
import {CreateAccount } from "./components/createAccount";

function App() {
  return (
    <div className="App">
      <CreateAccount/>
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
