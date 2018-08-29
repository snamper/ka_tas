require('../../public.js');
require('./css/scanInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		scanInfo:{
			status:'1',
			//1、可用的空卡；3、激活卡；4 无效卡；
			//2、有进行中的订单的卡；；5、已写卡等待开卡结果；6、已写卡开卡失败；7、无卡找号；（在slotInfo.html做处理，本页面没有改状态逻辑）
			//8、卡盟成卡；9、卡盟白卡；10、远盟成卡；11、远盟白卡
			iccid:'',
            selectPrice:"0",
            prestorePrice:"0",
            firstCharge:"0",
            facePrice:"0",
            createTime:0,
            phone:"00000000000",
            cityName:"--",
            descStr:"--",
            packageName:"--",
            feeDescribe: "--",
            optionals: [{
                optionalName: "--"
            }],
            belongType:"0",
            sourceOrder:""
        },
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'扫描卡信息',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
		},
		mounted:function(){

			let scanInfo=vm.getStore('SCAN_INFO');
			// let scanInfo={
			// 	status:'8',
			// 	iccid:'89860117841027577673',
	  //           selectPrice:"0",
	  //           prestorePrice:"0",
	  //           firstCharge:"0",
	  //           facePrice:"0",
	  //           createTime:0,
	  //           phone:"17080005263",
	  //           cityName:"--",
	  //           descStr:"--",
	  //           packageName:"--",
	  //           feeDescribe: "--",
	  //           optionals: [{
	  //               optionalName: "--"
	  //           }],
	  //           belongType:"0",
	  //           sourceOrder:"CK18082212000400012"
	  //       };
			if(scanInfo)vm.set('scanInfo',scanInfo);
			
		},
	},
	methods:{
		jump:function(type){
			let url = '',bizType;

			if(type == 8){
				url = '../active/chengCardPackage.html';
				bizType = '4';
			}else if(type == 9){
				url = '../active/whiteCard.html';
				bizType = '5';
			}

			let scanInfo = vm.get('scanInfo');
			vm.setStore('CARD_INFO',{
				iccid:scanInfo.iccid,
				sourceOrder:scanInfo.sourceOrder,
				phone:scanInfo.phone,
				deviceType:'1',
				bizType:bizType,
				belongType:scanInfo.belongType,
				faceMoney:scanInfo.facePrice,
			});
			vm.removeStore('CHANGE_PACKAGE_INFO');
			vm.removeStore('ORDER_INFO');
			Jsborya.pageJump({
                url:url,
                stepCode:'999',
                depiction:'开卡',
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:'801',
				depiction:'登录',
				destroyed:false,
				data:{
					phone:vm.get('scanInfo').phone
				}
			});
		},
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
		mathDiscount:function(money,discount){
			return vm.mathDiscount(money,discount);
		},
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
		getDateTime:function(timp){
			return this.getDateTime(timp);
		}
	}
});


});