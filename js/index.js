import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

const loadbar = document.getElementById('loadbar')

window.onload = async function(){
    loadbar.classList.add('atload')
    const gamelocaldata = localStorage.getItem('utente');
    if(gamelocaldata != null){
        localdata = JSON.parse(gamelocaldata)
        screenchange('gamemanager','block',0);
        screenchange('gamestat','flex',0);
    }else{
        screenchange('gamemanager','block',1);
        screenchange('gameuser','flex',0);
    }
    loadbar.classList.remove('atload')
    
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
    ReloadServerList()
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
    if(string == '') {return true}
    for(var i = string.length-1;i >= 0;i--){
        for(var x = chars.length-1;x >= 0; x--){
            if(string.charAt(i) == chars[x]){
                return true
            }
        }
    }
    return false
}

window.ReloadServerList = async function(){
    
    const ServerLista = document.getElementById('ServerLista')

    const gameserver = await getDataForNode('gameserver');
    
    if(gameserver != null){

        ServerLista.lastElementChild.remove()

        const ul = document.createElement('ul')

        for (const chiave in gameserver){
            const li =  document.createElement('li')

            const divtext = [chiave,`${Object.keys(gameserver[chiave].players).length}/${gameserver[chiave].maxplayer}`]

            for(const text in divtext){
                
                const div = document.createElement('div')

                div.innerText = divtext[text]

                li.appendChild(div)
            }

            li.onclick = function(){

                ReloadServerInfo(gameserver,chiave)
            }

            ul.appendChild(li)
        }
    
        ServerLista.appendChild(ul)

        ReloadServerInfo(gameserver,Object.keys(gameserver)[0])

    }else{

        ServerLista.firstElementChild.innerText = 'Nessun Server'

        ReloadServerInfo(null)
    }

}

window.ReloadServerInfo = function(gameserver,chiave){

    const ServerInfo = document.getElementById('ServerInfo');

    const listaplayer = ServerInfo.firstElementChild

    for(var i = ServerInfo.children.length-2;i >= 0;i--){
        ServerInfo.lastElementChild.remove()
    }

    if(gameserver !=  null){
        listaplayer.firstElementChild.src = `../img/scene/icon/${gameserver[chiave].scena}.jpg`

        listaplayer.lastElementChild.remove()
    
        const ul = document.createElement('ul')

        for(const player in gameserver[chiave].players){
            const li = document.createElement('li')
    
            li.innerText = player
    
            ul.appendChild(li)
        }
    
        listaplayer.appendChild(ul)

        const p = document.createElement('p')

        p.innerText = `Max Player | ${Object.keys(gameserver[chiave].players).length}/${gameserver[chiave].maxplayer} | Scena | ${gameserver[chiave].scena}`
    
        const button =  document.createElement('button')

        button.innerText = `Entra In | ${chiave}`

        button.onclick = function(){
            EntraInGame(gameserver,chiave)
        } 

        ServerInfo.appendChild(p)

        ServerInfo.appendChild(button)

    }
    
}

window.EntraInGame =  function (gameserver,chiave){

}

window.login = async function(){
    loadbar.classList.add('atload')
    const nome = document.getElementById('loginname')
    if(isStringContains(nome.value,[])){
        Wrong(nome);
    }else{
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
    loadbar.classList.remove('atload');
}

window.register = async function () {

    loadbar.classList.add('atload')

    const name = document.getElementById('registername')
    const password = document.getElementById('registerpassword')
    const confermapassword = document.getElementById('registerconfermapassword')

    if(isStringContains(name.value,[' ']) || await getDataForNode(`utenti/${name.value}`)){
        Wrong(name); 
    }else if(isStringContains(password.value,[' ','|','.',':',',',';'])){
        Wrong(password);
    }else if(password.value != confermapassword.value){
        Wrong(confermapassword);
    }else{
        const data = {
           dati : {
              name : name.value,
              password : password.value
           },
           saves : { 
           }
        }

    await addElementToNode(`utenti/${name.value}`,data)

    screenchange('gameuser','flex',0);}

    loadbar.classList.remove('atload');
}

window.logout = function() {
    screenchange('gamemanager','block',1);
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

window.addElementToNode = async function (nodeId, elementData) {
    const dbRef = ref(database, `/${nodeId}`);
    try {
        await set(dbRef, elementData);
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'elemento:", error);
    }
};
