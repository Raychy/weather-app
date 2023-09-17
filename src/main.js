

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import Widgets from 'fusioncharts/fusioncharts.widgets';
import PowerCharts from 'fusioncharts/fusioncharts.powercharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import VueFusionCharts from 'vue-fusioncharts';

import App from './App.vue'
import router from './router'

// Charts(FusionCharts);
// PowerCharts(FusionCharts);
// Widgets(FusionCharts);
FusionTheme(FusionCharts);

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueFusionCharts, FusionCharts);
app.use(Charts);
app.use(Widgets);
app.use(PowerCharts);
// app.use(FusionTheme);


app.mount('#app')
