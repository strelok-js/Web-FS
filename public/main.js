(async function () {
    const controller = {
        chosenFile: null,
        menuState:0,
        password: null
    };

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    const pathButton = document.getElementsByClassName("path-button")[0];
    pathButton.children[1].innerText = params.folder;

    
    const localDisc = await jsonFetch(location.protocol + '//' + location.host + "/api?localDisc=true"+"&pass="+params.pass);
    createDisc(localDisc);
    
    const intData = await jsonFetch(location.protocol + '//' + location.host + "/api?folder="+params.folder+"&pass="+params.pass);
    loadFiles(intData); 
    
    
    const menuDefault = `<ul class="context-menu__items">
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Открыть"
            ><i class="fa fa-eye"></i>Открыть</a
            >
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Удалить"
            ><i class="fa fa-times"></i>Удалить</a
            >
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Переиминовать"
            ><i class="fa fa-times"></i>Переиминовать</a
            >
        </li>
    </ul>`;
    const menuDefaultNotOpen = `<ul class="context-menu__items">
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Удалить"
            ><i class="fa fa-times"></i>Удалить</a
            >
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Переиминовать"
            ><i class="fa fa-times"></i>Переиминовать</a
            >
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Скачать"
            ><i class="fa fa-edit"></i>Скачать</a
            >
        </li>
    </ul>`;
    
    
    const menu = document.querySelector("#context-menu");

    contextListener();
    clickListener();
    keyupListener();
    resizeListener();

    // F U N C T I O N S
    function contextListener() {
        document.addEventListener("contextmenu", function (el) {
            const taskItemInContext = clickInsideElement(el, "filed");
            if(taskItemInContext) {
                if(controller.chosenFile.children[0].classList[0] === "folder-button") menu.innerHTML = menuDefault;
                else menu.innerHTML = menuDefaultNotOpen;
                el.preventDefault();
                toggleMenuOn();
                positionMenu(el);
            } else toggleMenuOff();
            
        });
    }
    function clickListener() {
        document.addEventListener("click", function (el) {
            const clickeElIsLink = clickInsideElement(el, "context-menu__link");
            if(clickeElIsLink) {
                el.preventDefault();
                menuItemListener(clickeElIsLink);
            } else /*if(el.button===0) */toggleMenuOff();
        });
    }
    function keyupListener() {
        window.onkeyup = function (el) {
            if(el.keyCode === 27) toggleMenuOff(); //ESC
        };
    }
    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }
    function toggleMenuOn() {
        if (controller.menuState !== 1) {
            controller.menuState = 1;
            menu.classList.add("context-menu--active");
        }
    }
    function toggleMenuOff() {
        if (controller.menuState !== 0) {
            controller.menuState = 0;
            menu.classList.remove("context-menu--active");
        }
    }
    function positionMenu(e) {
        const cords = getPosition(e);
        if (window.innerWidth-cords.x < menu.offsetWidth+4) menu.style.left = window.innerWidth-menu.offsetWidth+4+"px";
        else menu.style.left = cords.x+"px";
        
        if(window.innerHeight-cords.y < menu.offsetHeight+4) menu.style.top = window.innerHeight-menu.offsetHeight+4+"px";
        else menu.style.top = cords.y+"px";
    }
    async function menuItemListener(link) {
        const intDataItem = intData.find((item) => item.name === controller.chosenFile.id);
        
        switch (link.getAttribute("data-action")) {
            case "Открыть":
                window.location.replace(location.protocol + '//' + location.host + "/get?folder="+intDataItem.path+"&pass="+params.pass);
                break;
            case "Удалить":
                if(intDataItem.isDirectory) await fetch(location.protocol + '//' + location.host + "/api?pass="+params.pass+"&action=rmdir"+"&rmPath="+intDataItem.path);
                else await fetch(location.protocol + '//' + location.host + "/api?pass="+params.pass+"&action=rm"+"&rmPath="+intDataItem.path);
                window.location.reload();
                break;
            case "Переиминовать":
                const text = prompt("Введите новое название",controller.chosenFile.children[0].children[1].innerText);
                if(!text) break;
                await fetch(location.protocol + '//' + location.host + "/api?pass="+params.pass+"&action=rename"+"&oldWay="+intDataItem.path+"&newName="+text);
                window.location.reload();
                break;
            case "Скачать":
                const file = await fetch(location.protocol + '//' + location.host + "/api?pass="+params.pass+"&action=download"+"&way="+intDataItem.path+"&isDirectory="+intDataItem.isDirectory);

                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                const dwnFileURL = window.URL.createObjectURL(await file.blob());
                a.href = dwnFileURL;
                a.download = intDataItem.name;
                a.click();
                window.URL.revokeObjectURL(dwnFileURL);
                break;
            default:
                break;
        }
        toggleMenuOff();
    }
    function choiceFile(div) {
        function choose () {
            if(controller.chosenFile === div) return;
            div.classList.add("chosen");
            div.children[0].classList.add("chosen");
            if (controller.chosenFile) {
                controller.chosenFile.classList.remove("chosen");
                controller.chosenFile.children[0].classList.remove("chosen");
            }
            controller.chosenFile = div;
        };
        div.addEventListener("click", choose);
        div.addEventListener("contextmenu", choose);
        div.addEventListener("dblclick", () => {
            const intDataItem = intData.find(item => item.name === controller.chosenFile.id);
            if(intDataItem.isDirectory) window.location.replace(location.protocol + '//' + location.host + "/get?folder="+intDataItem.path+"&pass="+params.pass);
        });
    }

    async function jsonFetch(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }
    function createDisc(localDisc) {
        localDisc = localDisc.reverse();
        const currentFolder = document.getElementById("discImmedate");
        for (const disc of localDisc) {
            const div = document.createElement("div");
            //div.className = "disks-button";
            div.id = disc;
            div.innerHTML = `<div class="slot">
            <button class="disks-button">
            <img
                src="imgs/hardDisk.png"
                alt="disk"
                width="20px"
                height="20px"
            />
            <p>Диск ${disc.slice(0,1)}</p>
            </button>
            </div>`;
            div.addEventListener("click", () => {
                window.location.replace(location.protocol + '//' + location.host + "/get?folder="+disc+"&pass="+params.pass);
            });
            currentFolder.prepend(div);
        }
    }
    function loadFiles(intData) {
        const currentFolder = document.getElementById("currentFolder");
        for (const file of intData) {
            if (file.isDirectory) {
                const div = document.createElement("div");
                div.className = "folder-slot";
                div.id = `${file.name}`;
                div.innerHTML = `<button class="folder-button filed"><img src="imgs/folder.png" alt="disk" width="20px" height="20px"/><p>${file.name}</p></button>`;
                currentFolder.prepend(div);
                choiceFile(div);
            } else {
                const div = document.createElement("div");
                div.className = "folder-slot";
                div.id = `${file.name}`;
                div.innerHTML = `<button class="file-button filed" id="${file.name}_btn"><img src="imgs/file.png" alt="disk" width="20px" height="20px"/><p>${file.name}</p></button>`;
                currentFolder.append(div);
                choiceFile(div);
            }
        }
    }
    function clickInsideElement(e, className) {
        const el = e.srcElement||e.target;
        if (el.classList.contains(className)) return el;
        else {
            const parentNode = el.parentNode;
            if (parentNode.classList && parentNode.classList.contains(className)) return parentNode;
        }
        return false;
    }
    
    function getPosition(el) {
        const cord = {};
        if(!el) el = window.event;
        
        if (el.pageX||el.pageY) {
            cord.x = el.pageX;
            cord.y = el.pageY;
        } else if(el.clientX||el.clientY) {
            cord.x = el.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
            cord.y = el.clientY+document.body.scrollTop+document.documentElement.scrollTop;
        }
        return cord;
    }
}());
