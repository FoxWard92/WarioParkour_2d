import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyAcAKZvsgp_iIGBGluUaDPSmxQJOGaFTfk",
    authDomain: "wario-parkour.firebaseapp.com",
    databaseURL: "https://wario-parkour-default-rtdb.firebaseio.com",
    projectId: "wario-parkour",
    storageBucket: "wario-parkour.firebasestorage.app",
    messagingSenderId: "693490415402",
    appId: "1:693490415402:web:cf30b1e1698306c1b6d053",
    measurementId: "G-V099PR2HXK"

};

let localdata = null

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const database = getDatabase(app);

window.onload = async function(){
    const gamelocaldata = localStorage.getItem('utente');
    if(gamelocaldata != null){
        localdata = JSON.parse(gamelocaldata)
        screenchange('gamemanager','block',0);
        screenchange('gamestat','flex',0);
    }else{
        screenchange('gamemanager','block',1);
        screenchange('gameuser','flex',0);
    }

}

window.screenchange = function(Class,Display,Index){
    const arr = document.getElementsByClassName(`${Class}`)
    for(var i = arr.length-1; i >= 0;i--){
        if(i == Index){
            arr[i].style.display = Display;
        }else{
            arr[i].style.display = 'none';
        }
    }
}

window.Wrong = function(Wrong){
    if(!Wrong.classList.contains('Wrong')){
        Wrong.classList.add('Wrong');
        setTimeout(function(){
            Wrong.classList.remove('Wrong');
        },1000)
    }
}

window.isStringContains = function(string,chars){
    if(string === '') {return false}
    for(var i = string.length-1;i >= 0;i--){
        for(var x = chars.length-1;x >= 0; x--){
            if(string.charAt(i) == chars[x]){
                return true
            }
        }
    }
    return false
}

window.login = async function(){
    const nome = document.getElementById('loginname')
    if(nome.value == ''){Wrong(nome); return null}
    const password = document.getElementById('loginpassword')
    const data = await getDataForNode(`utenti/${nome.value}`)
    if(data){
        if(data.dati.password == password.value){
            localdata = data
            localStorage.setItem('utente',JSON.stringify(data))
            screenchange('gamemanager','block',0);
            screenchange('gamestat','flex',0);
        }else{
            Wrong(password)
        }
    }else{
        Wrong(nome)
    }
}

window.register = async function () {
    const name = document.getElementById('registername')

    if(isStringContains(name.value,[' ']) || await getDataForNode(`utenti/${name.value}`)){Wrong(name); return null}

    const password = document.getElementById('registerpassword')

    if(isStringContains(password.value,[' ','|','.',':',',',';'])){Wrong(password); return null}

    const confermapassword = document.getElementById('registerconfermapassword')

    if(password.value != confermapassword.value){Wrong(confermapassword); return null}

    screenchange('gameuser','flex',0);

}

window.getDataForNode = async function (NodeId) {
    const dbRef = ref(database, `/${NodeId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error getting data:", error);
        return null
    }
};
