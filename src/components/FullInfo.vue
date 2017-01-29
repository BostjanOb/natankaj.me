<template>
	<div id="fullInfo" v-if="station_id">
		<button class="button" @click="closeFullInfo()">Zapri</button>
		<div v-if="loading"><i class="fa fa-spinner fa-spin"></i> </div>
		<div v-if="!loading && station != null">
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
								<li v-for="(name, key) in types"
									v-if="station.prices[0][key] != null"
									:class="{ 'is-active': type == key }">
									<a @click="type = key">
										{{ name }}
									</a>
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
	import * as constants from '../constants';

	export default {
		name: 'full-info',
		data() {
			return {
			    loading: false,
			    types: constants.FUEL_TYPES,
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
				this.loading = true;

				axios.get('http://natankaj.dev/api/v1/stations/' + this.station_id)
					.then(response => {
						this.station = response.data.data;
						this.loading = false;
				});
			},
		}
	}
</script>
