import React, {Component} from 'react';
import cookie from 'react-cookies'
import './index.css'

class Header extends Component {
    handleLoginOut = () => {
        cookie.remove('username', { path: '/' })
        cookie.remove('loginSuccess', { path: '/' })
        window.location.href = '/'
    }
    render () {
        const username = cookie.load('username')
        return (
            <div className="myHeader">
                <div id="webTitle" onClick={() => {window.location.href = username !== undefined ? '/index' : '/login'}}>
                    <img src='./images/logo.svg' alt='logo' id='logo'/>
                    <mark>
                        <span className='myTitle'><i className="myFont">浙</i></span>
                        <span className='myTitle'><i className="myFont">联</i></span>
                        <span className='myTitle'><i className="myFont">智</i></span>
                        <span className='myTitle'><i className="myFont">慧</i></span>
                        <span className='myTitle'><i className="myFont">平</i></span>
                        <span className='myTitle'><i className="myFont">台</i></span>
                    </mark>
                </div>
            </div>
        );
    }
}

export default Header;