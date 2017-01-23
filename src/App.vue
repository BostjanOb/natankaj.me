<template>
	<div class="map">
		<div id="map"></div>
		<div class="filter">
			<div class="control is-grouped">
				<button class="button" :class="{ 'is-primary': type == 'fuel95' }" @click="changeType('fuel95')">95
				</button>
				<button class="button" :class="{ 'is-primary': type == 'fuel100' }" @click="changeType('fuel100')">100
				</button>
				<button class="button" :class="{ 'is-primary': type == 'diesel' }" @click="changeType('diesel')">
					Diesel
				</button>
				<button class="button" :class="{ 'is-primary': type == 'lpg' }" @click="changeType('lpg')">Lpg</button>
				<button class="button" :class="{ 'is-primary': type == 'oil' }" @click="changeType('oil')">Oil</button>
			</div>
		</div>

		<div id="fullInfo" v-if="showFullInfo && fullInfo != null">
			<button class="button" @click="closeFullInfo()">Zapri</button>
			<div class="card">
				<div class="card-image">
					<figure class="image is-4by3">
						<img src="/static/img/1280x960.png" alt="Image">
					</figure>
				</div>
				<div class="card-content is-paddingless">
					<div class="media" style="margin: 1.5rem 1.5rem 0.75rem;">
						<div class="media-left">
							<figure class="image" style="height: 40px; width: 40px;">
								<img :src="'/static/img/' + fullInfo.company.slug + '.jpg'" alt="petrol">
							</figure>
						</div>
						<div class="media-content">
							<p class="title is-4">{{ fullInfo.name }}</p>
							<p class="subtitle is-6">{{ fullInfo.address }}</p>
						</div>
					</div>

					<div class="content" v-if="fullInfo.prices.length > 0">
						<div class="tabs is-fullwidth">
							<ul style="margin: 1em 0 0">
								<li v-if="fullInfo.prices[0].fuel95 != null"
									:class="{ 'is-active': fullInfoType == 'fuel95' }">
									<a @click="fullInfoType = 'fuel95'">95</a>
								</li>
								<li :class="{ 'is-active': fullInfoType == 'fuel100' }"><a
									@click="fullInfoType = 'fuel100'">100</a></li>
								<li :class="{ 'is-active': fullInfoType == 'diesel' }"><a
									@click="fullInfoType = 'diesel'">Diesel</a></li>
								<li v-if="fullInfo.prices[0].lpg != null"
									:class="{ 'is-active': fullInfoType == 'lpg' }">
									<a @click="fullInfoType = 'lpg'">LPG</a>
								</li>
								<li v-if="fullInfo.prices[0].oil != null"
									:class="{ 'is-active': fullInfoType == 'oil' }">
									<a @click="fullInfoType = 'oil'">Olje</a>
								</li>
							</ul>
						</div>

						<table class="table is-striped is-narrow">
							<thead>
							<tr>
								<th>Cas</th>
								<th>Cena</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="price in fullInfo.prices">
								<td>{{ price.created_at }}</td>
								<td>{{ price[fullInfoType] }} €</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import axios from 'axios';
	import MarkerWithLabel from './tools/markerwithlabel';
	import InfoBox from './tools/infobox';

	export default {
		data() {
			return {
				test: 'fdafdsf',
				bounds: {},
				center: {},
				map: null,
				stations: [],
				type: 'fuel95',
				infobox: null,
				showFullInfo: false,
				fullInfo: null,
				fullInfoType: 'fuel95'
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
                                    <div class="has-text-centered"><button class="button is-info" id="moreInfoBtn">Vec informacij</button></div>
                                    <small>Zadnja osvezitev: ${station.price.updated_at}</small>
                                </div>
                                    `;

				let myOptions = {
					content: boxText
					, disableAutoPan: false
					, maxWidth: 0
					, pixelOffset: new google.maps.Size(-140, 0)
					, zIndex: null
					, boxClass: 'card'
					, closeBoxMargin: "10px 2px 2px 2px"
					, closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
					, infoBoxClearance: new google.maps.Size(1, 1)
					, isHidden: false
					, pane: "floatPane"
					, enableEventPropagation: false
				};


				this.infobox = new InfoBox(myOptions);
				this.infobox.open(this.map, station.marker);

				setTimeout(() => {
					document.getElementById('moreInfoBtn').addEventListener('click', () => {
						this.openFullInfo(station);
						this.infobox.close();
					});
				}, 0);
			},

			getPriceTable(prices) {
				let rt = '<table><tbody>';

				if (prices.fuel95)
					rt += `<tr><th>95</th><td>${prices.fuel95} €</td></tr>`;

				if (prices.fuel100)
					rt += `<tr><th>100</th><td>${prices.fuel100} €</td></tr>`;

				if (prices.diesel)
					rt += `<tr><th>Diesel</th><td>${prices.diesel} €</td></tr>`;

				if (prices.lpg)
					rt += `<tr><th>LPG</th><td>${prices.lpg} €</td></tr>`;

				if (prices.oil)
					rt += `<tr><th>Kurilno olje</th><td>${prices.oil} €</td></tr>`;

				rt += '</tbody></table>';
				return rt;
			},

			openFullInfo(s) {
				this.showFullInfo = true;

				axios.get('http://natankaj.dev/api/v1/stations/' + s.id)
					.then(response => {
						this.fullInfo = response.data.data;
						console.log(response);
					});
			},

			closeFullInfo() {
				this.showFullInfo = false;
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
				navigator.geolocation.getCurrentPosition(pos => {
					this.map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
					this.map.setZoom(12);
				}, () => {
				});
			}

			this.loadStations();
		}
	}
</script>

<style lang="scss">
	@import "node_modules/bulma/bulma";

	body, html, .map {
		padding: 0;
		margin: 0;
		height: 100%;
	}

	#app {
		display: flex;
		flex: 1;
		height: 100%;
	}

	.map {
		background-color: antiquewhite;
		flex-grow: 1;
		position: relative;

	.filter {
		position: absolute;
		left: 50%;
		margin-left: -100px;
		top: 10px;
		background-color: #2a5b76;
		padding: 10px;
		border-radius: 5px;
	}

	}

	#map {
		width: 100%;
		height: 100%;
	}

	.priceMarker {
		color: #fff;
		background-color: #000;
		font-size: 11px;
		font-weight: bold;
		text-align: center;
		width: 46px;
		height: 15px;
		border: 2px solid black;
		border-radius: 5px;
		white-space: nowrap;
		overflow: visible !important;
		opacity: 0.80;
		transition: opacity ease 2s;

	&
	.hidden {
		opacity: 0;
	}

	&
	:hover {
		background: red;
	}

	}

	.priceMarker:after, .priceMarker:before {
		top: 17px;
		left: 50%;
		border: solid transparent;
		content: " ";
		height: 0;
		width: 0;
		position: absolute;
		pointer-events: none;
	}

	.priceMarker:after {
		border-color: rgba(136, 183, 213, 0);
		border-top-color: #000000;
		border-width: 4px;
		margin-left: -4px;
	}

	.priceMarker:before {
		border-color: rgba(194, 225, 245, 0);
		border-top-color: #000000;
		border-width: 5px;
		margin-left: -5px;
	}

	.maininfo {
		background: #fff;
		border-radius: 10px;
		width: 250px !important;
		padding: 10px;
		box-shadow: 2px 2px 4px 2px #BABABA;

	button {
		display: block;
		margin: 10px;
		width: 220px;
	}

	>
	div > div {
		display: flex;
		justify-content: space-around;
		background-color: #eaeaea;
		border-radius: 5px;
		padding: 5px;
	}

	}

	#fullInfo {
		position: absolute;
		top: 0;
		left: 0;
		width: 300px;
		background: white;
		height: 100%;

	>
	button {
		position: absolute;
		left: 300px;
	}

	.card {
		overflow: scroll;
		height: 100%;
	}

	}
</style>
