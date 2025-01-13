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

let localgame = null

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const database = getDatabase(app);

let localscena = null

let DataMainplayer = null

const p = document.getElementById('loadcmd')

const gamescena = document.getElementById('gamescena')

const playercommand = ['a','d','w','escape']

window.onload = async function(){
    localgame = JSON.parse(localStorage.getItem('localgame'))
    console.log(localgame)
    if(localgame != null){

        console.log(localgame)
        screenchange('gamepage','block',0)

        p.innerText = `Recupero dati Scena Mappa[${localgame.scena}]`

        localscena = await getDataForNode(`gamedata/${localgame.scena}`)

        for(var i = 0; i < 10;i++){
            for(var j = 0; j < 10;j++){
                const div = document.createElement('div')
                div.classList.add(`${localscena[i][j]}`)
                div.classList.add(`gameobject`)
                if(localscena[i][j] !== 'air'){
                    div.style.backgroundImage = `url(../img/props/${localscena[i][j]}/${localgame.scena}.jpg)`
                }
                gamescena.appendChild(div)
            }
        }

        p.innerText = `Recupero Dati Giocatori da ${localgame.serverkey}`

        const nomeplayer = localgame.nameplayer

        localgame.players = await getDataForNode(`gameserver/${localgame.serverkey}/players`)

        DataMainplayer = createplayer(nomeplayer)

        gamescena.style.backgroundImage = `url(../img/scene/background/${localgame.scena}.jpg)`

        screenchange('gamepage','block',1)

        setInterval(async function (){
            const nameplayer = localgame.nameplayer
        
            let tplayer = await getDataForNode(`gameserver/${localgame.serverkey}/players`)
        
            if(!tplayer[nameplayer]){
                
                tplayer[nameplayer] = localgame.players[nameplayer]
            }
        
            for(const chiave in localgame.players){
                if(nameplayer !== chiave){
                    localgame.players[chiave] = tplayer[chiave]
                    createplayer(chiave)
                }
            }

            const GravityPos = localgame.players[nameplayer]
            if(GravityPos.posy < 90 && localscena[Math.floor(GravityPos.posy/10) + 1][Math.round(GravityPos.posx/10)] === 'air'){
                ObjectivesMoveDown(DataMainplayer,localgame.players[nameplayer],0.2)
            }
        
            localgame.players[nameplayer].ping = 1
            await addElementToNode(`gameserver/${localgame.serverkey}/players/${nameplayer}/`,localgame.players[nameplayer])
        },10)

    }else{
        history.replaceState(null, '', '../index.html');
        location.reload();
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

window.ObjectivesMoveUp = function(objectives,pos,movepx){
    const cordinates = (pos.posy - movepx)-20;
    if(cordinates > 0){
        pos.posy = cordinates;
        objectives.style.top = `${cordinates}%`
        return 1
    }
    return 0
}

window.ObjectivesMoveDown = function(objectives,pos,movepx){
    const cordinates = pos.posy + movepx;
    if(cordinates < 90){
        pos.posy = cordinates; 
        objectives.style.top = `${cordinates}%`
        return 1
    }
    return 0
}

window.ObjectivesMoveLeft = function(objectives,pos,movepx){
    const cordinates = pos.posx - movepx;
    if(cordinates >= 0){
        pos.posx = cordinates;
        pos.rotation = -1;
        objectives.style.left = `${cordinates}%`
        objectives.style.transform = 'scaleX(-1)'
        return 1
    }
    return 0
}

window.ObjectivesMoveRight = function(objectives,pos,movepx){
    const cordinates = pos.posx + movepx;
    if(cordinates < 100 - (objectives.offsetWidth / gamescena.offsetWidth * 100)){
        pos.posx = cordinates;
        pos.rotation = 1;
        objectives.style.left = `${cordinates}%`;
        objectives.style.transform = 'scaleX(1)'
        return 1
    }
    return 0
}

setInterval(async function(){

    const nameplayer = localgame.nameplayer

    const chiave = Object.keys(localgame.players)

    const len = chiave.length-1;

    if(len > 0){
        if(chiave[0] === nameplayer){
            for(var i = len; i >= 1;i--){
                await controlconnection(chiave[i])
            }
        }else if(chiave[len] === nameplayer){
            await controlconnection(chiave[0])
        }
    }

},5000)

window.createplayer = function(id){
    let player = document.getElementById(`${id}`)
    if(!player){
        const div = document.createElement('div')
        const p= document.createElement('p')
        p.innerText = id
        div.appendChild(p)
        div.id = id
        div.style.backgroundImage = `url(../img/player/walk.gif)`
        div.classList.add('players')
        gamescena.appendChild(div)
        player = div
    }
    const playerData = localgame.players[id];
    player.style.left = `${playerData.posx}%`
    player.style.top = `${playerData.posy}%`
    player.style.transform = `scaleX(${playerData.rotation})`
    return player
}

window.controlconnection = async function(playerkey){
    if(localgame.players[playerkey].ping){
        await addElementToNode(`gameserver/${localgame.serverkey}/players/${playerkey}/ping`,0)
    }else{
        delete localgame.players[playerkey]
        await addElementToNode(`gameserver/${localgame.serverkey}/players`,localgame.players)
        document.getElementById(`${playerkey}`).remove()
    }
}

const playeraction = [ObjectivesMoveLeft, ObjectivesMoveRight,ObjectivesMoveUp];

document.addEventListener('keydown', function(event) {
    for (const key in playercommand){
        if(playercommand[key] === event.key || playercommand[key] === (event.key).toLowerCase()){
            playeraction[key](DataMainplayer,localgame.players[localgame.nameplayer],1)
            
        }
    }
});

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
