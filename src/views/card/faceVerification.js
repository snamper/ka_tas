require('../../public.js');
require('../../assets/css/faceVerification.css');
var icon_shibie=require('../../assets/img/icon_shibie.png');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			face:!1,
			pass:!1,
		},
		checkInfoDesc:'',//检查预提交错误描述
		cardInfo:{//开卡信息
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			discount:10000,
			slot:0,
			deviceType:1,
			iccid:''
		},
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "cDiscount":10000,
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
            "pDiscount":10000,
            "packageCode":"0"
        },
        userInfo:'',//用户信息
        faceConfirmInfo:{//活体认证信息
        	'img':'',
        	'similarity':'0',
        	'softwareName':'',
        	'livingId':''
        }
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'活体识别',
				left:{
					icon:'back_white',
					value:'',
					callback:'headerLeftClick'
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO'),
				cardInfo=vm.getStore('CARD_INFO');
				
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('cardInfo',cardInfo);

				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						Jsborya.registerMethods('headerLeftClick',function(){
							vm.orderCancel(userInfo,orderInfo.sysOrderId);
						});
					}
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		toFaceVerification:function(){
			Jsborya.faceVerification({
				iccid:vm.get('cardInfo').iccid,
				name:vm.get('orderInfo').idCardName,
				number:vm.get('orderInfo').idCardNo,
				sysOrderId:vm.get('orderInfo').sysOrderId,
				complete:function(data){
					//alert(JSON.stringify(data));
					if(data.status==1){
						var limitSimilarity=parseFloat(vm.get('orderInfo').limitSimilarity),
						similarity=parseFloat(data.similarity);
						if(limitSimilarity<=similarity){
							vm.set('off.pass',true);
						}
						vm.set('faceConfirmInfo.similarity',similarity);
						vm.set('off.face',true);
					}else{
						//失败
						vm.set('off.face',false);
					}
				}
			});
		},
		uploadMutipleData(){
			const json={
				userInfo:vm.get('userInfo'),
				params:vm.getStore('USER_MUTIPLE_DATA')
			}
			vm.AJAX('/ka_tas/w/business/materialUpload',json,function(data){
				Jsborya.pageJump({
					url:'cardAudit.html',
					stepCode:999,
					depiction:'订单审核',
					header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
				});
			});
		},
		jumpToPrev:function(){
			Jsborya.pageBack({
                url:"certification.html",
                isLoad:true
            });
		},
		actionCheckInfo:function(){
			window.Timer=setInterval(function(){
				const json={
					userInfo:vm.get('userInfo'),
					params:vm.getStore('USER_MUTIPLE_DATA')
				}
				vm.AJAX('/ka_tas/w/business/checkInfoResult',json,function(data){
					let flag = parseInt(data.flag);

					if(flag!=0){
						clearInterval(window.Timer);
					}

					if(flag==1){
						vm.callMethod('uploadMutipleData')
					}else if(flag==2){
						vm.set('off.checkInfo',2)
					}
				});
			},1000);
		}
	}
});


});