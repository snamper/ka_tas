require('../../public.js');
require('./css/packageDetails.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{//控制开关
			
		},
		packageInfo: {
            feeDescribe:"--",
            standard:"",
            numberLevel:"1",
            cityName:"--",
            optPackList: [{
                standard:"--",
                feeDescribe: "--",
                code: "1",
                title: "--",
            }],
            phoneNum:"00000000000",
            packTitle:"暂无套餐",
            prestoreMoney:"0"
        },
	},
	hooks:{
        init:function(){
            vm=this;
            Jsborya.webviewLoading({isLoad:false});//关闭app加载层

    		let userInfo = vm.get('USER_INFO'),
                packageInfo = vm.getStore('PACKAGE_DETAILS')
            if(userInfo)vm.set('userInfo',userInfo);
            if(packageInfo)vm.set('packageInfo',packageInfo);
    	}
    },
	methods:{
        packageInfoClick:function(){//套餐资费说明
            layer.open({
                content:'<div class="select-info"><dl><dt>套餐名称</dt><dd class="b">'+vm.get('packageInfo').packTitle+'</dd></dl><dl><dt>资费说明</dt><dd>'+vm.get('packageInfo').feeDescribe+'</dd></dl></div>',
                btn:['确定'],
                type:1,
                style:'width:90%;max-width:540px;',
            });
        },
        bagInfoClick(index){
            let bagInfo = vm.get('packageInfo').optPackList[index];

            layer.open({
                content:'<div class="select-info"><dl><dt>套餐名称</dt><dd class="b">'+bagInfo.title+'</dd></dl><dl><dt>资费说明</dt><dd>'+bagInfo.feeDescribe+'</dd></dl></div>',
                btn:['确定'],
                type:1,
                style:'width:90%;max-width:540px;',
            });
        }
	}
});
});