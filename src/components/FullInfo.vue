<template>
	<div id="fullInfo" v-if="station != null">
		<div>
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
								<img :src="'/static/img/' + station.company.slug + '.jpg'" alt="petrol">
							</figure>
						</div>
						<div class="media-content">
							<p class="title is-4">{{ station.name }}</p>
							<p class="subtitle is-6">{{ station.address }}</p>
						</div>
					</div>

					<div class="content" v-if="station.prices.length > 0">
						<div class="tabs is-fullwidth">
							<ul style="margin: 1em 0 0">
								<li v-if="station.prices[0].fuel95 != null"
									:class="{ 'is-active': type == 'fuel95' }">
									<a @click="type = 'fuel95'">95</a>
								</li>
								<li :class="{ 'is-active': type == 'fuel100' }"><a
									@click="type = 'fuel100'">100</a></li>
								<li :class="{ 'is-active': type == 'diesel' }"><a
									@click="type = 'diesel'">Diesel</a></li>
								<li v-if="station.prices[0].lpg != null"
									:class="{ 'is-active': type == 'lpg' }">
									<a @click="type = 'lpg'">LPG</a>
								</li>
								<li v-if="station.prices[0].oil != null"
									:class="{ 'is-active': type == 'oil' }">
									<a @click="type = 'oil'">Olje</a>
								</li>
							</ul>
						</div>

						<table class="table is-striped is-narrow">
							<thead>
							<tr>
								<th>Čas</th>
								<th>Cena</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="price in station.prices">
								<td>{{ price.created_at }}</td>
								<td>{{ price[type] }} €</td>
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
	export default {
		name: 'full-info',
		data() {
			return {
			    station: null,
				type: 'fuel95'
			}
		},
		props: ['station_id'],
		watch: {
			station_id: function (newId) {
				console.log('yoo: ' + newId);
				this.loadStation();
			}
		},
		methods: {
			loadStation() {
				this.showFullInfo = true;

				axios.get('http://natankaj.dev/api/v1/stations/' + this.station_id)
					.then(response => {
						this.station = response.data.data;
						console.log(response);
				});
			},
		}
	}
</script>
