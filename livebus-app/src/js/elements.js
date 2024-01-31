//begin::select perso
const selects = document.querySelectorAll("select.form-control");
if(selects){
    selects.forEach((value, item)=>{
        const select_perso = document.createElement("div");
        select_perso.classList.add("select-perso");
        select_perso.classList.add("form-control");
        select_perso.appendChild(Object.assign(
            document.createElement("span"),
            {
                textContent: value.options[value.selectedIndex].text,
            }
        ));
        const select_perso_option = document.createElement("div");
        select_perso_option.classList.add("select-perso-options");
        Array.prototype.forEach.call(value.options, function(option, id){
            var option_select = document.createElement("a");
            option_select.text = option.text;
            option_select.classList.add("select-perso-option");
            if(value.selectedIndex==id)
                option_select.classList.add("select-perso-option-active");
            option_select.dataset.index = id;
            option_select.dataset.name = value.name;
            select_perso_option.append(option_select);
        });
        select_perso.append(select_perso_option);
        value.after(select_perso);
    });
}

function create_Select(select_name, option, selected, location, eventListener = false){
    const select_perso = document.createElement("div");
    select_perso.classList.add("select-perso");
    select_perso.classList.add("form-control");
    select_perso.appendChild(Object.assign(
        document.createElement("span"),
        {
            textContent: selected[1],
        }
    ));
    const select_perso_option = document.createElement("div");
    select_perso_option.classList.add("select-perso-options");
    option.forEach((option, id)=>{
        var option_select = document.createElement("a");
        option_select.text = option[1];
        option_select.classList.add("select-perso-option");
        if(selected[0]==id)
            option_select.classList.add("select-perso-option-active");
        option_select.dataset.index = id;
        option_select.dataset.name = select_name;
        option_select.dataset.value = option[0];
        select_perso_option.append(option_select);
    });
    select_perso.append(select_perso_option);

    //event listener
    //ouverture - fermeture de la liste des options
    var container_options = select_perso.querySelector(".select-perso-options");
    select_perso.addEventListener("click", function(){
        container_options.classList.toggle("show-options");
    });

    var options = select_perso.querySelector(".select-perso-options").querySelectorAll(".select-perso-option");
    options.forEach((option, option_index)=>{
        option.addEventListener("click", function(e){
            var select_name = this.dataset.name;
            var option_index = this.dataset.index;
            var option_value = this.dataset.value;
            var select = document.querySelector("select#"+select_name);
            select.selectedIndex = option_index;
            options.forEach(el=> {
                el.classList.remove("select-perso-option-active");
            });
            this.classList.add("select-perso-option-active");
            select_perso.querySelector("span").textContent = this.textContent;
        });
        if(eventListener){
            if(eventListener.click=="screen_action"){
                option.addEventListener("click", function(){
                    screens.action(this.dataset.name, this.dataset.value);
                })
            }
        }
    });

    //close if open
    document.addEventListener("click", function(event){
        if(container_options.classList.contains("show-options")){
            if(event.target!=select_perso&&event.target.offsetParent!=select_perso)
                container_options.classList.remove("show-options");
        }
    });

    location.append(select_perso);
}

//listen action on select perso
const selects_perso_all = document.querySelectorAll(".select-perso");
if(selects_perso_all){
    selects_perso_all.forEach((value, item)=>{
        //ouverture - fermeture de la liste des options
        var container_options = value.querySelector(".select-perso-options");
        value.addEventListener("click", function(){
            container_options.classList.toggle("show-options");
        });

        var options = value.querySelector(".select-perso-options").querySelectorAll(".select-perso-option");
        options.forEach((option, option_index)=>{
            option.addEventListener("click", function(e){
                var select_name = this.dataset.name;
                var option_index = this.dataset.index;
                var select = document.querySelector("select[name=\""+select_name+"\"]");
                select.selectedIndex = option_index;
                options.forEach(el=> {
                    el.classList.remove("select-perso-option-active");
                });
                this.classList.add("select-perso-option-active");
                value.querySelector("span").textContent = this.textContent;
            });
        });

        //close if open
        document.addEventListener("click", function(event){
            if(container_options.classList.contains("show-options")){
                if(event.target!=value&&event.target.offsetParent!=value)
                    container_options.classList.remove("show-options");
            }
        });
    });
}
//end::select perso