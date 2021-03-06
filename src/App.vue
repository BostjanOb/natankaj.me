<template>
	<div class="map">
		<div id="map"></div>
		<div class="filter">
			<div class="control is-grouped">
				<button class="button"
						v-for="(name, key) in types"
						:class="{ 'is-primary': type == key }"
						@click="changeType(key)">
					{{ name }}
				</button>
			</div>
		</div>

		<full-info :station_id="station_id"></full-info>
	</div>
</template>

<script>
	import MarkerWithLabel from './tools/markerwithlabel';
	import InfoBox from './tools/infobox';
	import FullInfo from './components/FullInfo.vue';
	import * as constants from './constants';

	export default {
	    components: { FullInfo },
		data() {
			return {
				map: null,
				types: constants.FUEL_TYPES,
				stations: [],
				type: 'fuel95',
				infobox: null,
				station_id: null
			}
		},

		methods: {
			changeType(type) {
				this.type = type;

				this.stations.forEach(s => {
					if (s.price[this.type] != null) {
						s.marker.set('labelContent', Number(s.price[this.type]).toFixed(3) + ' €');
						s.marker.set('labelClass', 'priceMarker');
					}
					else {
						s.marker.set('labelClass', 'priceMarker hidden');
					}
				});
			},

			openInfoBox(station) {
				if (this.infobox != null) {
					this.infobox.close();
				}

				let sName = 'petrol';
				if (station.company_id == 2) {
					sName = 'omv';
				}

				let boxText = document.createElement("div");
				boxText.className = "card-content";
				boxText.innerHTML = `<div class="media">
                                  <div class="media-left">
                                    <figure class="image" style="height: 40px; width: 40px;">
                                      <img src="/static/img/${sName}.jpg" alt="${sName}">
                                    </figure>
                                  </div>
                                  <div class="media-content">
                                    <p class="title is-4">${station.name}</p>
                                    <p class="subtitle is-6">${station.address}</p>
                                  </div>
                                </div>
								<div class="content">
									${this.getPriceTable(station.price)}
                                    <div class="has-text-centered"><button class="button is-info" id="moreInfoBtn">Več informacij</button></div>
                                    <small>Zadnja osvežitev: ${station.price.updated_at}</small>
                                </div>
                                    `;

				let myOptions = {
					content: boxText,
					disableAutoPan: false,
					maxWidth: 0,
					pixelOffset: new google.maps.Size(-140, 0),
					zIndex: null,
					boxClass: 'card',
					closeBoxMargin: "10px 2px 2px 2px",
					closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
					infoBoxClearance: new google.maps.Size(1, 1),
					isHidden: false,
					pane: "floatPane",
					enableEventPropagation: false
				};

				this.infobox = new InfoBox(myOptions);
				this.infobox.open(this.map, station.marker);

				setTimeout(() => {
					document.getElementById('moreInfoBtn').addEventListener('click', () => {
					    this.station_id = station.id;
						this.infobox.close();
					});
				}, 0);
			},

			getPriceTable(prices) {
				let rt = '<table><tbody>';

				for( let type in constants.FUEL_TYPES ) {
				    if ( prices[ type ] )
						rt += `<tr><th>${constants.FUEL_TYPES[type]}</th><td>${prices[type]} €</td></tr>`;
				}

				rt += '</tbody></table>';
				return rt;
			},

			loadStations() {
				axios.get('http://natankaj.dev/api/v1/stations', {params: {per_page: 9999}})
					.then(response => {
						this.stations = response.data.data;

						this.stations.forEach(s => {
							let marker = {
								position: {lat: s.lon, lng: s.lat},
								map: this.map,
								icon: ' ',
								labelContent: s.price[this.type] + ' €',
								labelAnchor: new google.maps.Point(25, 24),
								labelClass: "priceMarker",
							};

							s.marker = new MarkerWithLabel(marker);

							s.marker.addListener('click', () => {
								this.openInfoBox(s);
							});
						});
					});
			}
		},

		mounted() {
			this.map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 46.0661337, lng: 14.5320991},
				zoom: 8
			});

			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(({coords}) => {
					this.map.setCenter({lat: coords.latitude, lng: coords.longitude});
					this.map.setZoom(12);
				}, () => {});
			}

			this.loadStations();
		}
	}
</script>

<style lang="scss">
	@import "./scss/app.scss";
</style>
