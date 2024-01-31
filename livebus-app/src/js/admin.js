if(document.querySelector("[data-action='send_incident']"))
    document.querySelector("[data-action='send_incident']").addEventListener("click", function(){
        var incident = {
            'icon': document.querySelector("#ligne_incident").value,
            'titre': document.querySelector("#titre_incident").value,
            'message': document.querySelector("#message_incident").value,
        }
        socket.emit("incident", incident);
    });

if(document.querySelector("[data-action='reload_screen']"))
    document.querySelector("[data-action='reload_screen']").addEventListener("click", function(){
        socket.emit("actualisescreen", "true");
    });

if(document.querySelector("[data-action='save_config']")){
    var panelClass = new panel();

    document.querySelector("[data-action='save_config']").addEventListener("click", function(){
        if(panelClass.getDataStation(document.querySelector("#code_station_config").value)==false)
            alert("Cet station n'existe pas");
        else{
            setCookie("config_station_code", document.querySelector("#code_station_config").value, 1);
            var dataStation = panelClass.getDataStation(document.querySelector("#code_station_config").value);

            setCookie("config_station_nom", dataStation.nom);
            document.querySelector("#nom_station_config").innerHTML = "Nom de la station : <b>"+ dataStation.nom +"</b>";
        }
    });

    document.querySelector("#nom_station_config").innerHTML = "Nom de la station : <b>"+ getCookie("config_station_nom")+"</b>";
    document.querySelector("#code_station_config").value = getCookie("config_station_code");
}

class screens{
    create(arg, emplacement){
        const container = document.createElement("div");
        container.classList.add('screen');

        const icon = document.createElement("div");
        icon.append(
            Object.assign(
                document.createElement('img'),{
                    src:'/public/media/icone/informatique/screen.svg',
                    alt:'Icoône d\'un écran',
                }
            )
        )
        container.append(icon);

        const informations = document.createElement('div');
        informations.append(
            Object.assign(
                document.createElement("p"),{
                    className: 'station_code',
                    textContent: arg[0],
                }
            )
        )
        informations.append(
            Object.assign(
                document.createElement("p"),{
                    className: 'station_nom',
                    textContent:arg[1],
                }
            )
        )
        container.append(informations);

        const screen_page = document.createElement("div");
        screen_page.append(
            Object.assign(document.createElement("p"),{
                textContent: arg[3],
                className: 'screen_page',
            })
        )
        container.append(screen_page);

        const ip_adress = document.createElement("div");
        ip_adress.append(Object.assign(document.createElement("p"),{
            textContent: arg[4],
            className: 'screen_ip',
        }));
        container.append(ip_adress);

        const actions = document.createElement("div");
        const select = document.createElement("select");
        select.name = "actions-"+arg[0];
        select.id = "actions-"+arg[0];
        select.classList.add('form-control');
        function create_option(select, text, value){
            select.append(Object.assign(
                document.createElement("option"),{
                    textContent: text,
                    nodeValue: value,
                }
            ))
        }
        const options = [
            [null, 'Sélectionner une action'],
            ['start', 'Allumer'],
            ['no_passenger', 'Pas de voyageurs'],
            ['validation', 'Validation montée'],
            ['veille', 'Mettre en veille'],
            ['maintenance', 'Mettre en maintenance'],
            ['eteindre', 'Eteindre']
        ]
        options.forEach((option)=>{create_option(select, option[1], option[0]);})
        actions.append(select);
        create_Select("actions-"+arg[0], options, [0, "Selectionner une action"],actions, {'click':'screen_action'});
        // actions.append(select_actions);
        container.append(actions);
        emplacement.append(container);
    }
    static action(screen_name, action){
        screen_name = screen_name.substring(8);
        socket.emit("screen_action",
            {
                'screen': screen_name,
                'action': action,
            });
    }
}

if(document.querySelector(".screens_list")){
    const screens_Class = new screens();
    const screens_list = document.querySelector(".screens_list");
    socket.emit("list_screens", true);
    socket.on('list_screens', function(arg){
        screens_list.innerHTML = null;
        arg.forEach((screen)=>{
            screens_Class.create(screen, screens_list);
        })
    });
}

socket.on('incident', function(message){
    alert('Un incident viens d\'être signaler "'+message.titre+'"');
})