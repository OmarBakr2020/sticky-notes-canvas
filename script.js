document.onmousedown = clearMenus;

let Zmax = 0;
let notesCount = 0;
let z = 0;

function allowDrop(event) {
    event.preventDefault();
}

function RedrawNote(item) {
    const x = parseFloat(item.getAttribute('data-x')) - 100
    const y = parseFloat(item.getAttribute('data-y')) - 100
    const z = parseFloat(item.getAttribute('data-z'))

    const angle = parseFloat(item.getAttribute('data-rotate'))
    const backgroundColor = item.getAttribute('background-color');

    if (parseInt(item.getAttribute('data-z')) > Zmax) {
        Zmax = parseInt(item.getAttribute('data-z'));
    }

    item.onclick = function () {
        if (parseInt(this.getAttribute('data-z')) < Zmax) {
            Zmax++;
            this.setAttribute('data-z', Zmax);
            RedrawNote(this)
        }
    }

    item.setAttribute('style', 'background-color:' + backgroundColor + ';top:' + y + ';left:' + x + ';z-index:' + z + ';transform:rotate(' + angle + 'deg)')
}


function DrawNote() {

    const container = document.getElementsByClassName('notes-container')[0];

    const currentTop = 75;
    const currentLeft = 61;
    const angle = Math.random() * (20 - (-20) + 1) + (-20);

    notesCount++;

    //Create note container
    let note = document.createElement('div');
    note.className = 'Note';
    note.setAttribute('draggable', 'true');
    note.setAttribute('ondragstart', 'drag(event)');
    note.setAttribute('data-x', currentLeft);
    note.setAttribute('data-y', currentTop);
    note.setAttribute('data-z', ++z);
    note.setAttribute('data-rotate', angle);
    note.setAttribute('style', 'top:' + currentTop + ';left:' + currentLeft + ';z-index:' + z + ';transform:rotate(' + angle + 'deg)')
    //Create text input for note title
    let titleInput = document.createElement('textarea');
    titleInput.placeholder = 'Title';
    titleInput.className = 'title';
    note.appendChild(titleInput);

    //Create text box for the content of the note
    let textBox = document.createElement('textarea');
    textBox.placeholder = 'Write your note here'
    textBox.className = 'description';
    note.appendChild(textBox);

    //Create the option button for the note
    let iconsContainer = document.createElement('div');
    iconsContainer.className = 'icons';
    iconsContainer.onmousedown = noteMenu;
    note.appendChild(iconsContainer);

    let icon = document.createElement('i');
    icon.className = 'fas fa-pencil-alt';
    iconsContainer.appendChild(icon);

    let rotator = document.createElement('div');
    rotator.className = 'rotator';
    rotator.id = 'rotator' + notesCount;
    rotator.setAttribute('draggable', 'true');
    rotator.setAttribute('ondragstart', 'drag(event)');
    note.appendChild(rotator);

    let rotatorIcon = document.createElement('i');
    rotatorIcon.className = 'fas fa-sync-alt';
    rotator.appendChild(rotatorIcon);

    note.id = 'Note' + notesCount;

    container.appendChild(note);

    titleInput.focus();
}

function DeleteNote() {
    const notes = document.getElementsByClassName("Note");
    const canvas = document.querySelector("#canvas");
    while (notes.length > 0) {
        notes[0].parentNode.removeChild(notes[0]);
    }
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drop(event) {
    const id = event.dataTransfer.getData('item');
    const item = document.getElementById(id);
    console.log(item.parentNode.getAttribute('background-color'));
    if (id.indexOf('rotator') == 0) {
        const x0 = parseFloat(event.dataTransfer.getData('x0'));
        const x1 = event.clientX;
        const note = item.parentNode;
        const angle = parseFloat(note.getAttribute('data-rotate'));
        note.setAttribute('data-rotate', angle + (x0 - x1) / 10);
        RedrawNote(note);
    } else {
        item.setAttribute('data-x', event.clientX);
        item.setAttribute('data-y', event.clientY);
        RedrawNote(item)
    }
}

function drag(event) {
    if (event.target.classList.contains('rotator')) {
        event.dataTransfer.setData("x0", event.clientX);
    }

    event.dataTransfer.setData("item", event.target.id);

    if (parseInt(event.target.getAttribute('data-z')) < Zmax) {
        Zmax++;
        event.target.setAttribute('data-z', Zmax);
    }
}

window.onload = function () {
    let mode;
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");

    let sketch = document.querySelector(".notes-container");
    let sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue("width"));
    canvas.height = parseInt(sketch_style.getPropertyValue("height"));

    let mouse = { x: 0, y: 0 };
    let last_mouse = { x: 0, y: 0 };

    canvas.addEventListener("mousemove", function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);

    ctx.linewidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    canvas.addEventListener("mousedown", (e) => {
        canvas.addEventListener("mousemove", onPaint, false);
    }, false)

    canvas.addEventListener("mouseup", (e) => {
        canvas.removeEventListener("mousemove", onPaint, false);
    }, false)

    document.querySelector("#pen").addEventListener("click", function () { mode = "pen"; }, false);
    document.querySelector("#eraser").addEventListener("click", function () { mode = "eraser"; }, false);
    // document.querySelector("#select").addEventListener("click", function () { mode = ""; }, false);

    // let notes = document.getElementsByClassName('Note');
    const onPaint = () => {

        ctx.beginPath();
        if (mode === "pen") {
            ctx.globalCompositeOperation = "source-over";
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

        } else {
            ctx.globalCompositeOperation = "destination-out";
            ctx.arc(last_mouse.x, last_mouse.y, 10, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // ---------- FOR UPLOADING IMAGES ---------- //

    // if (window.File && window.FileList && window.FileReader) {
    //     const filesInput = document.getElementById("files");

    //     filesInput.addEventListener("change", function (event) {

    //         const files = event.target.files; //FileList object
    //         const output = document.getElementById("result");

    //         for (let i = 0; i < files.length; i++) {
    //             const file = files[i];

    //             //Only pics
    //             if (!file.type.match('image'))
    //                 continue;

    //             const picReader = new FileReader();

    //             picReader.addEventListener("load", function (event) {

    //                 const picFile = event.target;

    //                 const div = document.createElement("div");

    //                 div.innerHTML = "<img class='thumbnail' src='" + picFile.result + "'" +
    //                     "title='" + picFile.name + "'/>";

    //                 output.insertBefore(div, null);
    //                 div.style.position = "absolute";
    //                 div.style.left = "1100px";
    //                 div.style.top = "100px";

    //             });

    //             //Read the image
    //             picReader.readAsDataURL(file);
    //         }

    //     });
    // }
    // else {
    //     console.log("Your browser does not support File API");
    // }
}

function noteMenu() {

    let menus = document.getElementsByClassName('note-menu'); // Get all menus

    for (let i = 0; i < menus.length; i++) {
        menus[i].remove();
    }

    let noteMenu = document.createElement('div');
    noteMenu.className = "note-menu";

    let colors = [ // Nine different note colors
        'lightgoldenrodyellow',
        'lightblue',
        'lightgreen',
        'lightpink',
        'lightcoral',
        'lightskyblue',
        'lightsalmon',
        'plum',
        'lightseagreen'
    ];

    // Create nine different color buttons
    colors.forEach(color => {
        let colorOption = document.createElement('button');
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;
        colorOption.onmousedown = setColor;
        noteMenu.appendChild(colorOption);
    });

    // Create a delete button
    let deleteButton = document.createElement('div');
    deleteButton.className = 'delete-note';
    deleteButton.onmousedown = (() => { setTimeout(deleteNote.bind(deleteButton), 155); }); //Add a delay to let user see button press
    let deleteText = document.createElement('p');
    deleteText.textContent = 'Delete';
    deleteText.className = 'delete-text';
    deleteButton.appendChild(deleteText);
    let deleteIcon = document.createElement('img');
    deleteIcon.src = 'images/delete-24px-red.svg';
    deleteIcon.className = 'delete-icon';
    deleteButton.appendChild(deleteIcon);
    noteMenu.appendChild(deleteButton);

    this.parentNode.appendChild(noteMenu);
}

function setColor() {

    let note = this.parentNode.parentNode;
    let newColor = this.style.backgroundColor;

    note.style.backgroundColor = newColor;
    note.children[0].style.backgroundColor = newColor;
    note.children[1].style.backgroundColor = newColor;
    note.setAttribute('background-color', newColor);
}

function clearMenus(event) {

    let noteMenus = document.getElementsByClassName('note-menu'); // Get all menus

    for (let i = 0; i < noteMenus.length; i++) { // Loop through the menus
        let rect = noteMenus[i].getBoundingClientRect(); // Get the bounding rectangle to know the position

        // If the mouse is not above the menu, then remove it
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
            if (noteMenus[i].id == 'active') { //Remove the note only on a second click to account for clicking the option button
                noteMenus[i].remove();
            } else {
                noteMenus[i].id = 'active';
            }
        }
    }
}

function deleteNote() {
    let thisNote = this.parentNode.parentNode;

    thisNote.remove();
}