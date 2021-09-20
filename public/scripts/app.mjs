/** @format */

const mobileNav = {
	nav: document.querySelector('nav ul'),
	state: false,
	toggle() {
		!this.state
			? this.nav.setAttribute('state', true)
			: this.nav.setAttribute('state', false);

		this.state = !this.state;
	},
	init() {
		this.nav.setAttribute('state', false);

		window.addEventListener('click', (ev) => {
			if (ev.target.closest('#nav-mobile-button')) {
				this.toggle();
			}
			if (ev.target.closest('.nav-link')) {
				this.toggle();
			}
		});
	},
};

mobileNav.init();

/*

	The following code block handles all loaders. 

	- Loader.set - sets the loader to visible
	- Loader.close - closes the loader

*/

const Loader = {
	set(loader) {
		loader.style.display = 'flex';
	},
	close(loader) {
		loader.style.display = 'none';
	},
	dataLayer: document.querySelector('#data-loader'),
};

/*

	The following block handles error display

*/

const RenderError = (error, target) => {
	/*

		Create the error message

	*/

	const container = document.createElement('span');
	container.className = 'message-error';

	const message = document.createElement('p');
	message.textContent = `Fehler: ${error}`;

	const close = document.createElement('button');
	close.className = 'message-close';
	close.innerHTML = Pangolicons.icons.x.toString();

	/*

		Add a click event to the button to remove the container

	*/

	close.addEventListener('click', (ev) => {
		container.remove();
	});

	container.appendChild(message);
	container.appendChild(close);

	target.appendChild(container);
};

import {
	ValueWidget,
	TrafficLightWidget,
	HistoryWidget,
	VaccWidget,
} from './widget.mjs';
/*

    Fetch the Data from the backend

*/

const fetchDataFromSource = async () => {
	try {
		const res = await fetch('/api/data?timeframe=7&requesthistory=true');
		const { history } = await res.json();

		const currentData = history[history.length - 1];

		const dataDisplay = document.querySelector('#data-display');
		const dataLayer = document.querySelector('#data-widgets');

		// Create the 4 main display widgets

		dataLayer.appendChild(new TrafficLightWidget(currentData).render());
		dataLayer.appendChild(new ValueWidget(currentData.incidence).render());
		dataLayer.appendChild(
			new ValueWidget(currentData.hospitalization).render()
		);
		dataLayer.appendChild(
			new ValueWidget(currentData.icuOccupancy).render()
		);

		// create the linegraph widget

		const widgetHistory = new HistoryWidget(history);
		dataLayer.appendChild(widgetHistory.render());
		widgetHistory._constructLineGraph();

		// create the vaccination status widget

		dataLayer.appendChild(new VaccWidget(currentData.vaccination).render());

		/*

			Add the timestamp and source to the container

		*/

		const timeStamp = new Date(
			currentData.meta.dataCurrentAsOf
		).toLocaleString(window.navigator.language);

		const linkContainer = document.createElement('span');
		linkContainer.className = 'data-display-timestamp';
		linkContainer.innerHTML = `Daten aktuell: ${timeStamp}. Quelle: <a
		href="https://www.lgl.bayern.de/gesundheit/infektionsschutz/infektionskrankheiten_a_z/coronavirus/karte_coronavirus/index.htm" rel="norefferer noopener"
		target="_blank" >Bayrisches Landesamt für Gesundheit und
		Lebensmittelsicherheit</a>`;

		dataDisplay.appendChild(linkContainer);
	} catch (e) {
		RenderError(e, document.querySelector('#data-display'));
	}

	Loader.close(Loader.dataLayer);
};

fetchDataFromSource();
