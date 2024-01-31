/*configuration*/
const socket = io();

//API SERVER URL
var apiserver = "http://10.21.6.14:1337";
/*end configuration*/

function requestSync(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr.responseText;
};

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function timedate(){
    var now = new Date();
    var timestamp = {
        'annee': now.getFullYear(),
        'mois' : ('0'+parseInt(now.getMonth()+1)).slice(-2),
        'jour' : ('0'+now.getDate()   ).slice(-2),
        'heure' : ('0'+now.getHours()   ).slice(-2),
        'minutes' : ('0'+now.getMinutes()   ).slice(-2),
        'secondes' : ('0'+now.getSeconds()   ).slice(-2)
    }
    return timestamp;
}


//afficher la date et l'heure dans le header
function changeHeure(){
    var timestamp = timedate();
    const date_header = document.querySelector("#date");
    const heure_header = document.querySelector("#heure");

    date_header.textContent = timestamp.jour + "/" + timestamp.mois + "/" + timestamp.annee;
    heure_header.textContent = timestamp.heure + ':' + timestamp.minutes;
}
setInterval(changeHeure, 1000);


function bus_approch_anim(){
    //jouer annonce
    audio = new Audio("/public/sound/annonce/bus/en_approche.mp3");
    audio.play();

    const diapos = document.querySelectorAll("[data-diapo]");
    var i = 0;
    function changeDiapo(max = 2){
        document.querySelector(".diapo-active").classList.remove("diapo-active");
        document.querySelector("[data-diapo='"+i+"']").classList.add("diapo-active");
        if(i>=max)
            i=0;
        else
            i++;
    }
    setInterval(changeDiapo, 2500);
}

function panneaux_ligne(lignes){
    lignes.forEach((ligne, code)=>{
        alert(code);
    });
}

class horaires {
    constructor(horaires) {
        this.stationCode = getCookie("config_station_code");
        this.horairesLigne = horaires;
    }
    storeHoraires() {
        const horaires = this.horairesLigne.data
            .filter((horaire) => horaire.attributes.code_station === this.stationCode)
            .map((horaire) => ({
                heure: horaire.attributes.heure,
                retard: horaire.attributes.retard
            }));
        this.horairesLigne = horaires;
        return horaires;
    }
    nextDeparture(){
        var now = new Date();
        now = (now.getHours() * 60) + now.getMinutes();
        if(typeof this.horaires == 'undefined')
            this.storeHoraires();
        var ligneHoraire = this.horairesLigne;
        if(typeof ligneHoraire == 'undefined')
            return false;
        var prochainsDepart = ligneHoraire.filter(horaire => {
            const [heures, minutes] = horaire.heure.split(':').map(Number);
            const totalMinutes = heures * 60 + minutes;
            if(totalMinutes > now)
                return horaire;
            else if(horaire.retard){
                const [heures_retard, minutes_retard] = horaire.retard.split(':').map(Number);
                const totalMinutes_retard = heures_retard * 60 + minutes_retard;
                if(totalMinutes + totalMinutes_retard > now)
                    return horaire;
            }
        });
        function sortHoraires(a, b){
            const [a_heures, a_minutes] = a.heure.split(':').map(Number);
            var a_totalMinutes = a_heures * 60 + a_minutes;
            if(a.retard){
                var [heures_retard_a, minutes_retard_a] = a.retard.split(':').map(Number);
                a_totalMinutes += heures_retard_a * 60 + minutes_retard_a;
            }
            const [b_heures, b_minutes] = b.heure.split(':').map(Number);
            var b_totalMinutes = b_heures * 60 + b_minutes;
            if(b.retard){
                var [heures_retard_b, minutes_retard_b] = b.retard.split(':').map(Number);
                b_totalMinutes += heures_retard_b * 60 + minutes_retard_b;
            }
            if(a_totalMinutes < b_totalMinutes)
                return -1;
            else if (a_totalMinutes > b_totalMinutes)
                return 1;
            else if (a_totalMinutes == b_totalMinutes)
                return 0;
        }
        prochainsDepart.sort(sortHoraires);
        return prochainsDepart;
    }
    attente() {
        var now = new Date();
        now = (now.getHours() * 60) + now.getMinutes();
        //prochain depart
        var prochainDepart = this.nextDeparture()[0];
        if(!prochainDepart)
            return false;
        const [heures_depart, minutes_depart] = prochainDepart.heure.split(':').map(Number);
        const totalMinutes_depart = heures_depart * 60 + minutes_depart;
        var attente = totalMinutes_depart - now;
        if(attente > 59)
            return false;
        if(prochainDepart.retard){
            const [heures_retard, minutes_retard] = prochainDepart.retard.split(':').map(Number);
            const totalMinutes_retard = heures_retard * 60 + minutes_retard;
            var nouveau_depart = totalMinutes_depart + totalMinutes_retard;
            attente = nouveau_depart - now;
            if(attente > 59)
                return false;
        }
        return attente;
    }
    affichAttente(element, icone_ligne){
        var attente = this.attente();
        if(!attente)
            element.textContent = '-';
        else{
            function affich_attente(){
                attente--;
                if(attente==0){
                    setCookie("bus_approche_icone", icone_ligne)
                    window.location.href='/p/busapproche';
                }
                element.textContent = attente;
            }
            affich_attente();
            setInterval(affich_attente,60000);
        }
    }
}

class annonce{
    static play(sound){
        if(!sound)
            return false;
        var audio = new Audio(sound);
        audio.play();
    }
    jingle(){
        var sound = "/public/sound/jingle.mp3";
        annonce.play(sound);
        return 2500;
    }
    bonjour(){
        var sound = "/public/sound/annonce/generic/bonjour.mp3";
        annonce.play(sound);
        return 2500;
    }
    no_passengers(){
        var sound = "/public/sound/annonce/bus/pas_de_voyageurs.mp3";
        annonce.play(sound);
        return 25000;
    }
    comfort(){
        var sound = "/public/sound/annonce/generic/comfort.mp3";
        annonce.play(sound);
        return 5000;
    }
    validation(){
        var sound = "/public/sound/annonce/generic/validation.mp3";
        setTimeout(annonce.play, this.bonjour(), sound);
        setTimeout(this.comfort, 8500);
        return 9500;
    }
}

class panel{
    getDataStation(station_code = false){
        if(station_code==false)
            station_code = getCookie("config_station_code");
        const dataAPI = JSON.parse(requestSync(apiserver+"/api/stations-buses/?populate=*&filters[identifiant][$eq]="+station_code));
        if(dataAPI.data.length==0)
            return false;
        var attr = dataAPI.data[0].attributes;

        var lignes = new Array();
        attr.lignes_buses.data.forEach((ligne)=>{
            var dataLigne = JSON.parse(requestSync(apiserver+"/api/lignes-buses?populate=*&filters[identifiant][$eq]="+ligne.attributes.identifiant)).data[0].attributes;

            // lignes[ligne.attributes.identifiant]=ligne.attributes;
            lignes.push(dataLigne);

        });
        var bandeau = new Array();
        attr.bandeau_defilants.data.forEach((text)=>{bandeau.push(text.attributes.text)})

        var data = {
            'identifiant': attr.identifiant,
            'nom': attr.nom,
            'lignes': lignes,
            'bandeau_defilant': bandeau,
        }
        return data;
    }
    changeMessage(message, zone_Affichage){
        zone_Affichage.textContent = message;
    }
    message(messages, zone_Affichage) {
        const total = messages.length;
        var i = 0;
        setInterval(() => {
            this.changeMessage(messages[i], zone_Affichage);
            if (i >= total - 1)
                i = 0;
            else
                i++;
        }, 2500);
    }
    bandeau_defilant(){
          const data = this.getDataStation().bandeau_defilant;
          var i=0;
          var messages = "";
          data.forEach((message)=>{
            if (i==0)
                messages=message
            else
                messages+= " - "+message
            i++;
          })
          document.querySelector("aside > marquee").textContent= messages;
    }
    create_line(data){
        const horairesClass = new horaires(data.horaires_buses);

        const line = document.createElement("div");
        line.classList.add('ligne');
        line.dataset.codeLigne = data.identifiant;

        const information_ligne = document.createElement("div");

        const icone_ligne = document.createElement("div");
        icone_ligne.append(Object.assign(document.createElement("img"),{src: apiserver + data.icone.data.attributes.url,}))
        information_ligne.append(icone_ligne);

        const dest_message = document.createElement("div");
        dest_message.append(Object.assign(document.createElement("h2"),{textContent: data.direction}))
        const message = document.createElement("p");
        var messages = new Array();
        data.messages_buses.data.forEach((message)=>{messages.push(message.attributes.message);});
        this.message(messages, message);
        message.classList.add('message');
        dest_message.append(message);
        information_ligne.append(dest_message);
        line.append(information_ligne);

        var attente = document.createElement("div");
        var attente_affich = document.createElement("p");
        attente_affich.classList.add("attente");
        horairesClass.affichAttente(attente_affich, apiserver + data.icone.data.attributes.url);
        attente.append(attente_affich);
        line.append(attente);
        document.querySelector("#lignes_horaires").append(line);
    }
}

class incident{
    get_data(){return JSON.parse(getCookie("incident"));}
    redirect(){window.location.href="/";}
    annonce(){
        //jouer annonce
        var audio = new Audio("/public/sound/annonce/metro/incident/b_incident.mp3");
        audio.play();
    }
    affich(){
        const data = this.get_data();
        //zone affichage
        const ligne_icon = document.getElementById("incident_ligne");
        const incident_title = document.getElementById("incident_title");
        const incident_message = document.getElementById("incident_message");

        this.annonce();

        ligne_icon.src = data.icon;
        incident_title.textContent = data.titre;
        incident_message.textContent = data.message;
        setTimeout(this.redirect, 20000);
    }
}

socket.on('screen_action', function(data){
    if(data.screen == getCookie("config_station_code") || data.screen==false){
        if(data.action=="veille")
            window.location.href = "/state/veille";
        else if(data.action=="eteindre")
            window.location.href="/state/eteint";
        else if(data.action=="maintenance")
            window.location.href="/state/maintenance";
        else if(data.action=="start")
            window.location.href="/";
        else if(data.action=="no_passenger")
            window.location.href="/p/pas-de-voyageurs";
        else if(data.action=="validation")
            window.location.href="/p/validation";
    }
})