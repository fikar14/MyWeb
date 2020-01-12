require('./bootstrap');

window.Vue = require('vue');
import vuetify from './vuetify';
import router from './router';

//Component dengan menggunakan router
import App from './components/AppComponent';

//Componen tanpa menggunakan router
// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

new Vue({
    el: '#app',
    router,
    vuetify,
    components:{
        mode: 'history',
        'app':App,
    }
});
