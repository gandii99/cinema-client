const showId = localStorage.getItem('showId');
let seat_reservation = document.querySelector('.containerSeat');
let tablica = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
let submit = document.getElementById('submit');
let freeSeats = null;
let seat_selected = null;

let titleTicket = null;
let timeTicket = null;

let seatsForm = null;

let name_form = null;
let lastName_form = null;
let email_form = null;
let phone_form = null;

loadHeader(showId);

function generateSeats(freeSeats){
    for(let i=0; i<12; i++){
        if(i==0){
            seat_reservation.innerHTML = '<div id="screenSeat">EKRAN</div>';
            for(let k = 0; k<13; k++){
                if(k===0){
                    seat_reservation.innerHTML += '<div class="seat numbCol" ></div>';
                }else{
                    seat_reservation.innerHTML += '<div class="seat numbCol" >'+k+'</div>';
                }
            }
        }
        for(let j=0; j<12; j++){
            if(j===0){
                seat_reservation.innerHTML += '<div class="seat numbRow" style="background: none">'+tablica[i]+'</div>';
            }
            if(i!==10 && i!==11){
                if(freeSeats.includes(tablica[i]+(j+1))){
                    seat_reservation.innerHTML += '<div class="seat free" id="'+tablica[i]+(j+1)+'"></div>';
                }else{
                    seat_reservation.innerHTML += '<div class="seat occupied" id="'+tablica[i]+(j+1)+'"></div>';

                }

            }else if(j%2===1){
                if(freeSeats.includes(tablica[i]+((j+1)/2))){
                    seat_reservation.innerHTML += '<div class="seat free" style="grid-column: '+ (j+1) +' / ' + (j+3) + '" id="'+tablica[i]+((j+1)/2)+'"></div>';
                }else{
                    seat_reservation.innerHTML += '<div class="seat occupied" style="grid-column:'+ (j+1) +' / ' + (j+3) + '" id="'+tablica[i]+((j+1)/2)+'"></div>';
                }
            }
        }

    }
    activeSeats();
}

function activeSeats(){
    seat_selected = document.querySelectorAll('.seat');
    seat_selected.forEach(function(elem) {
        if(elem.className !== 'seat occupied') {
            elem.addEventListener("click", function () {
                if (elem.className === 'seat selected' /*|| elem.className === 'seat vip selected'*/) {
                    elem.classList.remove('selected');
                    elem.classList.add('free');
                } else if (elem.className === 'seat free' /*|| elem.className === 'seat vip free'*/) {
                    elem.classList.remove('free');
                    elem.classList.add('selected');
                }
            });
        }
    });
}


submit.addEventListener('click', function (e){
    e.preventDefault();
    let selectedSeat = [];
    seat_selected.forEach(function (elem){

        if(elem.className === 'seat selected' /*|| elem.className === 'seat vip selected'*/ ){
            selectedSeat.push(elem.id);
        }

    });
    if(validateForm()){
        let form_res = {
            name:$("#name").val(),
            lastName: $("#last_name").val(),
            email: $("#email").val(),
            phone: $("#phone_nr").val()
        };
        let seats = '';
        for(let i=0; i<selectedSeat.length; i++){
            seats += selectedSeat[i];
            if(i<selectedSeat.length-1){
                seats += ',';
            }
        }

        $.ajax({
            url: 'https://cinema-project-server.herokuapp.com/api/customer?seats='
                + seats
                + '&showId='+showId,
            type: 'POST',
            data: JSON.stringify(
                {"firstName":form_res.name,
                "lastName": form_res.lastName,
                "email": form_res.email,
                "phoneNumber": form_res.phone}),
            contentType: 'application/json; charset=utf-8',
            success: function (link){
                name_form = form_res.name;
                lastName_form = form_res.lastName;
                phone_form = form_res.phone;
                email_form = form_res.email;
                seatsForm = seats;
                document.querySelector('.toLateReservation').innerHTML = `<b style="color: green;"> Zarezerwowałeś: `+seats+` </b> &nbsp;<button class="btn" onclick="generateTicket(name_form, lastName_form, email_form, phone_form, titleTicket, seatsForm, timeTicket) "  >Pobierz bilet </button> `;


                },
            error: function (){
                fetch('https://cinema-project-server.herokuapp.com/api/shows/'+showId+'/freeSeats')
                    .then(resp => resp.json())
                    .then(resp => {
                        freeSeats = resp.freeSeats;
                        generateSeats(freeSeats);
                        document.querySelector('.toLateReservation').innerHTML = `<b> Niestety, spóźniłeś się. Wybrane miejsca zostały już zarezerwowane przez kogoś innego.</b> `;
                    });
            }
        });


    }

});


function validateForm() {
    let message = '';
    let a = document.forms["form_reservation"]["name"].value;
    let b = document.forms["form_reservation"]["last_name"].value;
    let c = document.forms["form_reservation"]["email"].value;
    let d = document.forms["form_reservation"]["phone_nr"].value;
    if (a == null || a === "") {
        message += "Nie podano imienia!\n";
    }else if(!/^[A-Za-ząćęłńóśźż\s]+$/.test(a)){
        message += "Podano błędne imię!\n";
    }
    if(b == null || b === ""){
        message += "Nie podano nazwiska!\n";
    }
    const reg = /^[-\w\.]+@([-\w]+\.)+[a-z]+$/i;
    if(c == null || c === ""){
        message += "Nie podano emaila!\n";
    }else if(!reg.test(c)){
        message += "Podano błędny email!\n";
    }
    if(d == null || d === ""){
        message += "Nie podano numeru telefonu!\n";
    }else if(d.length < 9){
        message += "Podano zbyt krótki numeru telefonu!\n";
    }
    let selectedSeat = [];
    seat_selected.forEach(function (elem){
        if(elem.className === 'seat selected' /*|| elem.className === 'seat vip selected'*/){
            selectedSeat.push(elem.id);
        }
    });
    if(selectedSeat.length === 0) {
        message += "Nie wybrano miejsca!\n";
    }
    if(message.length>0){
        alert(message);
        return false;
    }
    return true;
}

function reservationTicket(){
    if(document.querySelector('.categories').style.display === 'none'){
        //document.querySelector('.categories').style.height = '800px';
        document.querySelector('.categories').style.display = 'block';
        fetch('https://cinema-project-server.herokuapp.com/api/shows/'+showId+'/freeSeats')
            .then(resp => resp.json())
            .then(resp => {
                freeSeats = resp.freeSeats;
                generateSeats(freeSeats);
            });
        let element = document.querySelector('.categories');
        element.scrollIntoView();
        element.scrollIntoView(false);
        element.scrollIntoView({block: "center"});
        element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    }else{
        document.querySelector('.categories').style.display = 'none';
    }
}

function loadHeader(showId){
    fetch('https://cinema-project-server.herokuapp.com/api/shows/'+showId)
        .then(resp => resp.json())
        .then(resp => {
            resp = resp[0];
            document.getElementById('reservationTitle').innerText = resp.title;
            titleTicket = resp.title;
            timeTicket = resp.showStart;
            document.getElementById('reservationDescription').innerText = resp.description;
            document.getElementById('reservationDirector').innerText = 'Reżyser: ' + resp.director;
            document.getElementById('reservationScenario').innerText = 'Scenariusz: ' + resp.scenario;
            document.getElementById('reservationType').innerText = 'Gatunek: ' + resp.type;
            document.getElementById('reservationProduction').innerText = 'Produkcja: ' + resp.production;
            document.getElementById('reservationPremiere').innerText = 'Premiera: ' + resp.premiere;
            document.querySelector('.headerButton').innerHTML += `<a class="btn" onclick="reservationTicket(id)" id="`+showId+`">Zarezerwuj bilet &#8594;</a>`;
            document.getElementById('pictureActualyFilm').innerHTML = `<img src="file/`+resp.pictureName+`.jpg" alt="av">`;
            document.querySelector('.trailerEnd').innerHTML += '<iframe width="100%" height="500px" src="'+resp.trailerLink+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        });
}

function generateTicket(name, lastName, email, phoneNumber, title, seats, time) {
    console.log("tak")
    let doc = new jsPDF()

    doc.setTextColor(61, 61, 92);
    doc.setFontStyle
    doc.text(20, 20, 'Bilet na film');

    doc.setFontStyle('bold');
    doc.setFontSize('15');
    doc.text(20, 40, title);

    doc.setFontSize('20');
    doc.text(20, 65, 'Miejsca\: ' + seats);
    doc.text(20, 75, time);

    doc.setFontSize('15');
    doc.text(20, 100, 'dane: ' + name + ' ' + lastName);
    doc.text(20, 110, 'email: ' + email);

    doc.text(20, 120, 'telefon: ' + phoneNumber);

    doc.save('bilet.pdf');
};





