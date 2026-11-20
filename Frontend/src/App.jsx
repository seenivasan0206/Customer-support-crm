import React, {useState} from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';
function App(){
  const [activePage, setActivePage]=useState('dashboard');
  return (
    <div className='app-layout'>
      <Sidebar
      activePage={activePage}
      setActivePage={setActivePage}
      />
      <div className='main-section'>
        <Header/>
        <div className='page-content'>
          <h2>{activePage}</h2>
        </div>

      </div>
      
    </div>
  );
}

export default App;