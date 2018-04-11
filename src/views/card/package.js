require('../../public.js');
require('../../assets/css/package.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:0,
			packageType:0,
			loadPackage:0
		},
		totalPrice:0,//价格计算
		cardInfo:{
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0
		},
		selectPackage:{
			name:'',
			packageCode:'',
			selPackCode:'',
			prestore:'',
		},
		imsiInfo:{
			imsi:'',
			smsp:''
		},
		recommendList:[{name:'流量多',type:'2'},{name:'语音多',type:'3'},{name:'最省钱',type:'4'},{name:'全部',type:'1'}],
		userInfo:'',//用户信息
		packageList:[]
	},
	hooks: {
	    init: function() {
	    	//this.setStore('CARD_INFO',{});
	    	//this.removeStore('CARD_INFO');
	    	//this.setStore('selectPackage',{name:'联通无限流量套餐',packageCode:'1002',selPackCode:'1254',prestore:'320',});
	    	//this.removeStore('selectPackage');
	    	vm=this;
	    	
	    	Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let cardInfo=vm.getStore('CARD_INFO'),
				selectPackage=vm.getStore('selectPackage');
			if(cardInfo){
				vm.set('cardInfo',cardInfo);

				let deviceType=cardInfo.deviceType,icon='';
				if(cardInfo.deviceType==1){
					if(cardInfo.deviceStatus==1){
						icon='card_green';
					}else icon='card_red';
					
				}else if(cardInfo.deviceType==2){
					if(cardInfo.deviceStatus==1){
						icon='wcard_green';
					}else icon='wcard_red';
					
				}
				Jsborya.setHeader({
					title:'选择套餐',
					frontColor:'#ffffff',
					backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'',
						callback:''
					},
					right:{
						icon:icon,
						value:'',
						callback:'headerRightClick'
					}
				});
				if(selectPackage){
					vm.set('selectPackage',selectPackage);
					vm.set('totalPrice',(parseFloat(cardInfo.phoneMoney)/100+parseFloat(selectPackage.prestore)/100).toFixed(2));
				}
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);
					vm.callMethod('getPackageList');
					Jsborya.registerMethods('headerRightClick',function(){
						if(cardInfo.deviceType==1){
							Jsborya.pageJump({
								url:"simInfo.html",
								stepCode:999,
								depiction:'SIM卡信息',
								destroyed:false,
								header:{
			                        frontColor:'#ffffff',
			                        backgroundColor:'#4b3887',
			                    }
							});
						}else if(cardInfo.deviceType==2){
							Jsborya.pageJump({
								url:'',
								stepCode:803,
								depiction:'设备管理',
								destroyed:false,
							});
						}
					});
				});
			}else{
				alert('本地号卡信息错误');
			}
	    },
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage');
	    	},300);
	    }
	},
	methods:{
		setPage:function(){
			const window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
			document.getElementById("packageList").style.maxHeight=window_h-308+'px';
		},
		readCardICCID:function(){
			vm.set("off.load",1);
			Jsborya.readCardIMSI(function(data){
				if(data.status==1){
					vm.set('imsiInfo',{
						imsi:data.imsi,
						smsp:data.smsp
					});
					vm.callMethod("iccidCheck",[data.imsi,data.smsp]);
				}else{
					vm.set("off.load",false);
					vm.callMethod("filterConnectStatus",[data.status]);
				}
			});
		},
		filterConnectStatus:function(status){

			if(status==2){
				alert("读取失败");
			}else if(status==3){
				alert("未检测到SIM卡插入卡槽，请将SIM卡以正确的方式插入卡槽");
			}else{
				alert("异常错误");
				return false;
			}
		},
		iccidCheck:function(imsi,smsp){//获取订单信息
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/ka-tas/w/source/iccidCheck',json,function(data){
				vm.set("off.load",false);
				if(data.data.status==1){
					vm.callMethod('savePackage');
				}else if(data.data.status==2){
					layer.open({
						title:'提示',
                        content:'您有未完成的订单，请先完成或放弃该订单',
                        btn:['查看订单','放弃订单'],
                        yes:function(){
                        	vm.setStore('ORDER_INFO',data.data.orderInfo);
						    Jsborya.pageJump({
				                url:'orderInfo.html',
				                stepCode:999,
				                depiction:'订单详情',
				                header:{
				                    frontColor:'#ffffff',
				                    backgroundColor:'#4b3887',
				                }
				            });
                        },
                        no:function(){
                        	layer.closeAll();
		                    vm.AJAX('/ka-tas/w/business/orderCancell',{
		                        'params':{
		                            'sysOrderId':data.data.orderInfo.sysOrderId,
		                        },
		                        'userInfo':vm.get('userInfo')
		                    },function(data){
		                        
		                    });
                        },
                    });
				}else if(data.data.status==3){
					layer.open({
                        content:'当前卡已开卡成功，不能重复进行开卡操作',
                        btn:['确定'],
                        title:'提示'
                    });
				}else if(data.data.status==4){
					layer.open({
                        content:'当前卡为无效卡，请使用有效的号卡进行操作',
                        btn:['确定'],
                        title:'提示'
                    });
				}

				let deviceType=data.data.deviceType,icon='';
				if(deviceType==1){
					if(data.data.status==1){
						icon='card_green';
					}else icon='card_red';
					
				}else if(deviceType==2){
					if(data.data.status==1){
						icon='wcard_green';
					}else icon='wcard_red';
					
				}
				Jsborya.setHeader({
					title:'选择套餐',
					frontColor:'#ffffff',
					backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'',
						callback:''
					},
					right:{
						icon:icon,
						value:'',
						callback:'headerRightClick'
					}
				});

			},true,function(){
				vm.set("off.load",false);
			});
		},
		savePackage:function(){
			vm.set("off.load",2);
			const cardInfo=vm.get('cardInfo'),selectPackage=vm.get('selectPackage');
			const json={
	  			params:{
	  				phoneNum:cardInfo.phone,
	  				imsi:vm.get('imsiInfo').imsi,
	  				smsp:vm.get('imsiInfo').smsp,
	  				packageCode:selectPackage.packageCode,
	  				selPackCode:selectPackage.selPackCode,
	  				prestoreMoney:selectPackage.prestore,
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/ka-tas/w/business/orderCreate',json,function(data){
				vm.set("off.load",false);
				vm.setStore('ORDER_INFO',{
		            "phoneNum":cardInfo.phone,
		            "numberLevel":cardInfo.phoneLevel,
		            "cityName":cardInfo.cityName,
		            "createTime":data.data.createTime,
		            "cardMoney":cardInfo.phoneMoney,//号码占用费
		            "orderStatusCode":"PACKAGE_SELECTION",
		            "totalMoney":parseFloat(vm.get('totalPrice'))*100,//总价格
		            "limitSimilarity":0,
		            "validTime":0,
		            "sysOrderId":data.data.sysOrderId,
		            "packageName":selectPackage.name,
		            "packageCode":selectPackage.packageCode,
		            "prestoreMoney":selectPackage.prestore,//预存价格
		            "similarity":0,
		        });
				Jsborya.pageJump({
					url:'certification.html',
					stepCode:999,
					depiction:'实名认证',
					header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
				});
			},true,function(){
				vm.set("off.load",false);
			});
		},
		// jumpToPackageList:function(type,name){
		// 	Jsborya.pageJump({
		// 		url:'packageList.html?type='+BASE64.encode(JSON.stringify({val:type,name:name})),
		// 		stepCode:999,
		// 		depiction:'套餐列表',
		// 		destroyed:false,
		// 		header:{
  //                   frontColor:'#ffffff',
  //                   backgroundColor:'#4b3887',
  //               }
		// 	});
		// },
		shiftRcmd:function(index){
			if(vm.get('off').loadPackage)return false;
			vm.set('off.packageType',index);
			vm.callMethod('getPackageList');
		},
		getPackageList:function(){//获取套餐列表
			const json={
	  			params:{
	  				type:vm.get('recommendList')[vm.get('off').packageType].type,
	  				cityCode:vm.get('cardInfo').cityCode,
	  				phoneNum:vm.get('cardInfo').phone,
	  				size:20
	  			},
	  			userInfo:vm.get('userInfo')
	  		};

	  		vm.set('off.loadPackage',true);
			vm.AJAX('/ka-tas/w/source/packageList',json,function(data){
				let selectCode=vm.get('selectPackage').packageCode;
				if(selectCode){
					let arr=[],item={};
					data.data.titleList.forEach((value,index)=>{
						if(value.code==selectCode){
							item=value;
						}else arr.push(value);
					});
					arr.unshift(item);
					vm.set('packageList',arr);
				}else vm.set('packageList',data.data.titleList);
				
				
			},function(){
				vm.set('off.loadPackage',false);
			});
		},
		jumpToPackageDetails:function(code){
			Jsborya.pageJump({
				url:'packageDetails.html?code='+code+'&phoneLevel='+vm.get('cardInfo').phoneLevel,
				stepCode:999,
				depiction:'套餐详情',
				destroyed:false,
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
			});
		},
		phoneFormat:function(phone){
			return vm.phoneFormat(phone);
		},
		mathCentToYuan:function(money){
			return vm.mathCentToYuan(money);
		}
	}
});


});