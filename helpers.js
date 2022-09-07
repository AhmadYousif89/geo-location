export const AUTH_CODE = import.meta.env.VITE_AUTH_CODE;

export const getHTMLElement = selector => document.querySelector(selector);

export const renderError = msg =>
	(countriesContainer.innerHTML = `<span class='errMsg'>${msg}</span>`);

export const removeInvalidClass = element => element.classList.remove('invalid');

export const addInvalidClass = element => element.classList.add('invalid');

export const getJSON = async (url, options = {}) => {
	const {countryName = '', errMsg = 'Failed To Fetch Data'} = options;
	const response = await fetch(url);
	if (!response?.ok || response?.status > 399) {
		throw new Error(
			`${errMsg} | Country : ${countryName || '__'} | ${
				response.statusText + ' : ' + response.status
			}`,
		);
	}
	const data = await response.json();
	return data;
};
