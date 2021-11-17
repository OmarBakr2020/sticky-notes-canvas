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

    const containerHeight = document.documentElement.clientHeight - 120;
    const containerWidth = document.documentElement.clientWidth - 120;

    const currentTop = Math.random() * containerHeight + 1;
    const currentLeft = Math.random() * containerWidth + 1;
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
    const notesContainer = document.getElementsByClassName("notes-container")[0];
    notesContainer.innerHTML = "";
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

function noteMenu() {

    let menus = document.getElementsByClassName('note-menu'); // Get all menus
    let thisNoteHasMenu = (this.parentNode.getElementsByClassName('note-menu').length != 0); //Whether this particular note has an active menu

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