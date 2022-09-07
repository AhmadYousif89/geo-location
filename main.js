import {AUTH_CODE, addInvalidClass, getHTMLElement, getJSON, removeInvalidClass} from './helpers';

const countriesContainer = getHTMLElement('.countries');
const countryBtn = getHTMLElement('#btn-country');
const coordsBtn = getHTMLElement('#btn-coords');
const myGeoBtn = getHTMLElement('#btn-geo');

const renderError = msg => (countriesContainer.innerHTML = `<span class='errMsg'>${msg}</span>`);
const updateUI = () => {
	const html = '<h2>Loading...</h2>';
	countriesContainer.innerHTML = html;
	countriesContainer.style.opacity = 1;
};

const renderNeighbourList = neighbours => {
	if (!neighbours) return;
	const optionList = neighbours.map(n => `<option value="${n}">${n}</option>`);
	return optionList.join('');
};

const renderCountryCard = (options = {}) => {
	const {data, cssClass = ''} = options;
	const languages = [];
	const currencies = [];

	for (const key in data.languages) {
		languages.push(data.languages[key]);
	}
	for (const key in data.currencies) {
		currencies.push(data.currencies[key]);
	}

	const neighbours = data?.borders;

	const neighbourList = !neighbours
		? '<h3>No Neighbours !</h3>'
		: !cssClass
		? `
      <div class="neighbour-list"> Select Neighbour
        <select id="options">
          <option disabled selected>---</option>
          ${renderNeighbourList(neighbours)}
        </select>
      </div>`
		: '';

	const html = `
    <article class="country ${cssClass}">
      <img class="country__img" src='${data.flags.svg}' />
      <div class="country__data">
        <h3 class="country__name">${data.name.official}</h3>
        <div class="country__region">
          <p>${data.capital[0]}</p>
          <p>${data.subregion}</p>
        </div>
        <div class="country__info">
          <p class="country__row"><span>👫</span>${
						data.population >= 1000_000
							? (data.population / 1000_000).toFixed(2) + ' million'
							: data.population
					} people</p>
          <p class="country__row"><span>🗣</span>${[...languages].join(' | ')}</p>
          <p class="country__row"><span>💰</span>${currencies[0].name}</p>
          <p class="country__row"><span>🗺</span>
            Lat : ${data.capitalInfo.latlng[0]} | Lng: ${data.capitalInfo.latlng[1]}</p>
        </div>
        ${neighbourList}
      </div>
    </article>
    `;
	if (cssClass) {
		countriesContainer.insertAdjacentHTML('beforeend', html);
	} else {
		countriesContainer.innerHTML = html;
	}
	if (neighbours) {
		getHTMLElement('#options').addEventListener('change', getNeighbourCountry);
	}
};

/////////////////////////////////////////////////////////////////////

const getByCountry = async (country = '') => {
	const countryInput = getHTMLElement('#country-name');
	const enteredCountryName = countryInput.value.trim();

	if (!enteredCountryName && !country) {
		addInvalidClass(countryInput);
		countryInput.onblur = () => removeInvalidClass(countryInput);
	}
	updateUI();
	try {
		const [data] = await getJSON(
			`
    https://restcountries.com/v3.1/name/${country || enteredCountryName} `, // ORDER MATTER
			{countryName: country || enteredCountryName, errMsg: 'Invalid country name!'},
		);
		renderCountryCard({data});
	} catch (err) {
		if (getHTMLElement('.errMsg')) getHTMLElement('.errMsg').remove();
		renderError(err.message);
	}
};

const getByCoords = async (latt = 0, long = 0) => {
	const lat = getHTMLElement('#country-latt');
	const lng = getHTMLElement('#country-long');
	const latVal = lat.value.trim() || 0;
	const lngVal = lng.value.trim() || 0;

	if (!lat.value.trim() && !lng.value.trim() && !latt && !long) {
		addInvalidClass(lat);
		addInvalidClass(lng);
		lat.onblur = () => removeInvalidClass(lat);
		lng.onblur = () => removeInvalidClass(lng);
	}
	updateUI();
	try {
		const API_URL = `https://geocode.xyz/${latt || latVal},${
			long || lngVal
		}?geoit=json&auth=${AUTH_CODE}`;
		const data = await getJSON(API_URL);
		if (!data.country) throw new Error('Found NO Country!');
		const {country} = data;
		getByCountry(country);
	} catch (err) {
		renderError(err.message);
	}
};

const getMyGeoLocation = () => {
	navigator.geolocation.getCurrentPosition(pos => {
		const {longitude, latitude} = pos.coords;
		getByCoords(latitude, longitude);
	});
};

const getNeighbourCountry = async e => {
	if (getHTMLElement('.country.neighbour')) {
		getHTMLElement('.country.neighbour').remove();
	}
	try {
		const [data] = await getJSON(`https://restcountries.com/v3.1/alpha/${e.target.value}`);
		renderCountryCard({data, cssClass: 'neighbour'});
	} catch (err) {
		renderError(err.message);
	}
};

myGeoBtn.addEventListener('click', () => getMyGeoLocation());
countryBtn.addEventListener('click', () => getByCountry());
coordsBtn.addEventListener('click', () => getByCoords());
