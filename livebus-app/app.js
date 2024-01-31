const express = require('express')
const bodyParser = require('body-parser')
const app = express()
// ajout de socket.io
const server = require('http').Server(app)
const io = require('socket.io')(server)
const cookie = require("cookie") //installed from npm;
var usersLog = []
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile('/app/views/index.html', { root: __dirname })})
app.get('/config', function (req, res) {
    res.sendFile('/app/views/config.html', { root: __dirname })})
app.get('/state/:ScreenState', function (req, res) {
    res.sendFile('/app/views/etats/'+req.params.ScreenState+'.html', { root: __dirname })})
app.get('/p/:Panel', function (req, res) {
    res.sendFile('/app/views/panneau/'+req.params.Panel+'.html', { root: __dirname })})

app.get('/admin/panel', function (req, res) {
    res.sendFile('/app/views/commande/panel.html', { root: __dirname })})

app.use('/src', express.static(process.cwd() + '/src'))
app.use('/public', express.static(process.cwd() + '/public'))

// on change app par server
server.listen(3000, function () { console.log('Votre app est disponible sur localhost:3000 !')})

var screens = new Array();
// Création de la connexion
io.on('connection', (socket) =>{
    if(typeof socket.handshake.headers.cookie!='undefined') {
        var cookies_list = cookie.parse(socket.handshake.headers.cookie);
        if (typeof cookies_list.config_station_code == 'undefined' || typeof cookies_list.config_station_nom == 'undefined')
            var client_name = "Inconnu";
        else{
            var client_name = cookies_list.config_station_code + " " + cookies_list.config_station_nom;
            screens.push(new Array(cookies_list.config_station_code, cookies_list.config_station_nom, socket.id, socket.handshake.headers.referer, socket.handshake.address));
            screens.sort(function (a, b) {
                if (a[0] < b[0])
                    return -1;
                else
                    return 1;
            });
        }
        io.emit("list_screens", screens);
    }
    else
        var client_name = "Inconnu";

    console.log(`Connecté au client ${socket.id}` + " - " + client_name + " - " + socket.handshake.address)

    //evenements
    socket.on("incident", (arg) => {
        console.log("nouvelle incident : \"" + arg.titre + "\"")
        io.emit('incident', arg);
    });
    socket.on("actualisescreen", (arg) => {
        console.log("Actualisation des écrans")
        io.emit('actualisescreen', "true");
    });
    socket.on("list_screens", (arg) => {
        console.log("liste des écrans demandée par : " + cookies_list.config_station_code);
        io.emit("list_screens", screens);
    })
    socket.on("screen_action", (arg) => {
       io.emit("screen_action", arg);
    });

    socket.on("disconnect", (arg) =>{
        var screen_id = "";
        screens.forEach((screen, index)=>{
            if(screen[2]==socket.id)
                screen_id = index;
        })
        screens.splice(screen_id, 1);
        if(typeof cookies_list != 'undefined')
            console.log("disconnect "  + cookies_list.config_station_nom);
        else
            console.log("Inconnu");
    });
});