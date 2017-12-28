// import Moon from 'moonjs'
import utils from './assets/js/utils.js'

window.Moon=require('moonjs');
Moon.use(utils);

var FastClick = require('fastclick');
FastClick.attach(document.body);

require("./assets/css/base.css");
require('./assets/js/layer/layer.js');
require("./assets/js/layer/layer.css");
require("./assets/js/max.borya_app.js");

window.onload = function() {
    document.body.addEventListener("touchstart", function() {})
};
