const searchBtn = document.getElementById('searchBtn');
const flightOfferTemplate = document.getElementById('flight-template');
const flightOfferList = document.getElementById('flight-list');
const departureDateInput = document.getElementById('departureDate');
const loader = document.querySelector(".loader");
const originInput = document.getElementById('origin');

const params = new URLSearchParams(document.location.search);
const destinationInput = document.getElementById('destination');
departureDateInput.min = new Date().toISOString().split("T")[0];
departureDateInput.value = params.get("departureDate");
document.getElementById("returnDate").value = params.get("returnDate");

searchBtn.addEventListener('click', e => {
    e.preventDefault();
    loader.classList.remove("d-none");
    const origin = originInput.value;
    const destination = destinationInput.value;
    const departureDate = departureDateInput.value;
    fetch(`/flight-search?originCode=${origin}&destinationCode=${destination}&departureDate=${departureDate}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => {
        return response.json();
    }).then(data => {
        const airportList = document.getElementById('flight-list');
        airportList.innerHTML = ""; // Clear previous results
        console.log(data.data);
        data.data.forEach(offer => {
            let flightOffer = flightOfferTemplate.content.cloneNode(true);
            console.log(flightOffer);
            flightOffer.querySelector('.flight-name').innerHTML = offer.source;
            flightOffer.querySelector('.flight-price').innerHTML = offer.price.total + " " + offer.price.currency;
            details = "";
            offer.itineraries[0].segments.forEach(itinerary => {
                details += `<div class="flight-details">Departure: ${itinerary.departure.iataCode} ${itinerary.departure.at} - Arrival: ${itinerary.arrival.iataCode} ${itinerary.arrival.at}</div>`;
            });
            offer.travelerPricings[0].fareDetailsBySegment[0].amenities.forEach(amenity => {
                details += `<div class="flight-details">Amenities: ${amenity.description}</div>`;
            });
            flightOffer.querySelector('.flight-details').innerHTML = details;
            flightOffer.querySelector('.book-button').addEventListener('click', () => {
                fetch('/addCartItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                        {
                            name: `${offer.source} - ${origin} to ${destination} on ${departureDate}`,
                            price: offer.price.total,
                            id: offer.id,
                            type: "Flight",
                        }
                    )
                }).then(response => {
                    return response.text();
                }).then(data => {
                    console.log(data);
                    alert("Flight booked successfully!");
                }).catch(err => {
                    console.error(err);
                });
            });
            flightOfferList.appendChild(flightOffer);
            loader.classList.add("d-none");
        });
    }).catch(err => {
        console.error(err);
    }
    )
});