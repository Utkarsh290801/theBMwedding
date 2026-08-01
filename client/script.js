// ==========================
// Wedding Countdown
// ==========================

const weddingDate = new Date("December 11, 2026 00:00:00").getTime();

function updateCountdown() {

    const now = new Date().getTime();

    const distance = weddingDate - now;

    if (distance < 0) {

        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";

        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
        (distance % (1000 * 60)) /
        1000
    );

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;

}

updateCountdown();

setInterval(updateCountdown,1000);


// ==========================
// Smooth Scroll
// ==========================

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        e.preventDefault();

        const section=document.querySelector(this.getAttribute("href"));

        if(section){

            section.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});


// ==========================
// Mobile Menu
// ==========================

const menu=document.querySelector(".mobile-menu");

const nav=document.querySelector(".nav-links");

async function loadGuestCount() {

    const guestCountElement = document.getElementById("guestCount");

    if (!guestCountElement || typeof API === "undefined") return;

    try {
        const response = await API.get("/notes");
        const totalGuests = (response.data || [])
            .filter(note => note.category === "Guests")
            .reduce((total, note) => total + (Number(note.guestCount) || 0), 0);

        guestCountElement.textContent = totalGuests;
    } catch (error) {
        console.error("Unable to load guest count", error);
    }

}

loadGuestCount();
setInterval(loadGuestCount, 30000);

window.addEventListener("storage", event => {

    if (event.key === "notes-updated") {
        loadGuestCount();
    }

});

menu.addEventListener("click",()=>{

    nav.classList.toggle("show");

});