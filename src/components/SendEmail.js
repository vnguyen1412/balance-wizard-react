import ComposeEmail from "./ComposeEmail";
import DefaultPage from "./DefaultScreen";
import React, { useEffect, useState } from 'react';
import './Styling.css';

function Email(){
    return (
        <div>
            <div className="overlay">
                <h2 className="user-box-title">Email Page</h2>
                <ComposeEmail />
            </div>
            <DefaultPage />
        </div>
        
    );
}
export default Email;