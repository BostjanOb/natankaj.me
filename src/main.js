import Vue from 'vue';
import App from './App';
import axios from 'axios';

window.axios = axios;

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
});
