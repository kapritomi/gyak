import { useState, useEffect} from 'react';
import { CustomNavbar } from './Navbar.js'
import { SideMenu } from './Sidemenu.js'
import axios from 'axios';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';


export default function Landing({isSideOpen, setIsSideOpen,  filterBySearch, setSelectedFilters}){
    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);
    const [ emailsave, setEmailSave] = useState("");
    const [ users, setUsers] = useState([]);
    const [ loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://192.168.1.146:3000/felhasznalo');
            const jsonData = await response.json();
            setUsers(jsonData);
            
        };
        fetchData();
    }, [users]);

    useEffect(()=>{
        if(profile){
            setEmailSave(profile.email)
        }
    },[profile, emailsave])

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {setUser(codeResponse); dataPost(emailsave); setLoggedIn(true)},
        onError: (error) => console.log('Login Failed:', error)
        
    });

    const dataPost =(email)=>{
        let a = []
        for (let i = 0; i < users.length; i++) {
            a.push(users[i].felhasznalo_email)
        }
        console.log(a)
        console.log(emailsave)
        if(a.indexOf(email)=== -1){
            fetch('http://192.168.1.146:3000/regisztracio', {
                    method: 'POST',
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify({
                         emailsave,
                    })
                }).then(
                    console.log("siker")
                )
        }
        else{
            console.log("ez már szerepel")
        }
    }

    useEffect(
        () => {
            if (user) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                        localStorage.setItem('items', JSON.stringify(user));
                        localStorage.setItem('loggedin', JSON.stringify(loggedIn));
                    })
                    .catch((err) => console.log(err));
            }
        },
        [ user, loggedIn]
    );
    
    useEffect(() => {
        window.onbeforeunload = function() {
            return true;
        };
        return () => {
            const items = JSON.parse(localStorage.getItem('items'));
            const item = JSON.parse(localStorage.getItem('loggedin'));
            if (items) {
                setUser(items)
                setLoggedIn(item)
            }
            window.onbeforeunload = null;
        };
    }, []);
     
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setUser(null);
        localStorage.clear();
    };
   
   
    const activeButton = 1;

    return(
        <div className='background'>
            <SideMenu isSideOpen={isSideOpen}
                      setIsSideOpen={setIsSideOpen}
                      activeButton={activeButton}/>
            <CustomNavbar  isSideOpen={isSideOpen}
                           setIsSideOpen={setIsSideOpen}
                           filterBySearch={filterBySearch}
                           setSelectedFilters={setSelectedFilters}/>

                            {profile && loggedIn ? (
                                <div>
                                    <img src={profile.picture} alt="user" />
                                    <h3>User Logged in</h3>
                                    <p>Name: {profile.name}</p>
                                    <p>Email Address: {profile.email}</p>
                                    <br />
                                    <br />
                                    <button onClick={logOut}>Log out</button>
                                </div>
            ) : (
                <button onClick={login}>Sign in with Google 🚀 </button>
            )}
        </div>
    )
}