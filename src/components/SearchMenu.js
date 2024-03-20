import React, { useEffect, useState } from 'react';
import DefaultPage from './DefaultScreen';
import './Styling.css';

function Search(){
    return (
        <div>
            <div className='overlay' >
                <h2 className="user-box-title">Search Page</h2>
                <textarea className='searchBar' placeholder='Search..' rows={1} cols={50}/>
            </div>
            <DefaultPage />
        </div>
    );
}
export default Search;