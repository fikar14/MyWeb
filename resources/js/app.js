require('./bootstrap');

window.Vue = require('vue');
import vuetify from './vuetify';
import router from './router';

//Component dengan menggunakan Router
import Example from './components/ExampleComponent';

//Menggunakan component tanpa router
// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

new Vue({
    el: '#app',
    vuetify,
    router,
    components:{
        'example-component':Example
    }
});
