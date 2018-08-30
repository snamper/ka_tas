require('../../public.js');
require('./css/packageDevoted.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
            load:0,
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
            prestoreMoney:"0",
            code:0,
            discount:10000
        },
        userInfo:'',
        imsiInfo:{
            imsi:'',
            smsp:''
        },
        cardInfo:{
            phone:'00000000000',
            cityName:'未知',
            cityCode:'100',
            pretty:'1',
            phoneMoney:0,
            phoneLevel:0,
            discount:10000,
            slot:0,
            deviceType:1,
            belongType:0,
            iccid:''
        },
	},
	hooks: {
        init: function() {
            vm=this;
            
            Jsborya.webviewLoading({isLoad:false});//关闭app加载层

            let cardInfo=vm.getStore('CARD_INFO');

            if(cardInfo){
                vm.set('cardInfo',cardInfo);

                let userInfo = vm.getStore("USER_INFO");
                if(userInfo){
                    vm.set('userInfo',userInfo);
                    
                    let setRight = {
                        icon:'',
                        value:'',
                        callback:'headerRightClick'
                    };
                    if(userInfo.iccid=='666666666666'){
                        setRight={
                            icon:'',
                            value:'购卡指引',
                            callback:'headerRightClick'
                        };
                    }
                    
                    Jsborya.setHeader({
                        title:'号码搜索',
                        left:{
                            icon:'back_white',
                            value:'返回',
                            callback:''
                        },
                        right:setRight
                    });

                    vm.callMethod('getPackageInfo');

                    Jsborya.registerMethods('headerRightClick',function(){
                        if(userInfo.iccid=='666666666666'){
                            vm.toBuyHelpPage();
                            return false;
                        }
                    });
                }
            }else{
                alert('本地号卡信息错误');
            }
        },
        mounted:function(){
            
        }
    },
	methods:{
		getPackageInfo(){
			var vm=this;
			var json={
	  			params:{
	  				phoneNum:vm.get('cardInfo').phone
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/privatePhoneInfo',json,function(data){
				vm.set('packageInfo',data.data);
			})
		},
        packageInfoClick:function(){//套餐资费说明
            const vm = this;

            layer.open({
                content:'<div class="m-select-info"><dl><dt>套餐名称</dt><dd class="b">'+vm.get('packageInfo').packTitle+'</dd></dl><dl><dt>资费说明</dt><dd>'+vm.get('packageInfo').feeDescribe+'</dd></dl></div>',
                btn:['确定'],
                type:1,
                style:'width:90%;max-width:540px;top:-30px;',
            });
        },
        bagInfoClick(index){
            const vm = this;

            let bagInfo = vm.get('packageInfo').optPackList[index];

            layer.open({
                content:'<div class="m-select-info"><dl><dt>套餐名称</dt><dd class="b">'+bagInfo.title+'</dd></dl><dl><dt>资费说明</dt><dd>'+bagInfo.feeDescribe+'</dd></dl></div>',
                btn:['确定'],
                type:1,
                style:'width:90%;max-width:540px;top:-30px;',
            });
        },
        readCardICCID:function(){
            
            if(vm.get('userInfo').iccid=='666666666666'){
                layer.open({
                    content:'无卡将无法进行下一步操作，如您需要购卡，请点击购卡指引',
                    btn:['购卡指引','关闭'],
                    shadeClose:false,
                    title:'提示',
                    yes:function(){
                        vm.toBuyHelpPage();
                    },
                    no:function(){
                        vm.jumpToHome();
                    }
                });
                return false;
            }
            vm.set("off.load",1);
            Jsborya.readCardIMSI({
                slot:vm.get('cardInfo').slot,
                complete:function(data){
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
                }
            });
        },
        filterConnectStatus:function(status){

            if(status==2){
                layer.open({
                    content:'读取失败',
                    btn:['确定'],
                    title:'提示'
                });
            }else if(status==3){
                layer.open({
                    content:'未检测到SIM卡插入卡槽，请将SIM卡以正确的方式插入卡槽',
                    btn:['确定'],
                    title:'提示'
                });
            }else{
                layer.open({
                    content:'异常错误',
                    btn:['确定'],
                    title:'提示'
                });
            }
        },
        iccidCheck:function(imsi,smsp){//获取订单信息
            const json={
                params:{
                    imsi:imsi||'',
                    smsp:smsp||'',
                    scanIccid:''
                },
                userInfo:vm.get('userInfo')
            };
            vm.AJAX('/tas/w/source/iccidCheck',json,function(data){
                vm.set("off.load",false);
                if(data.data.status==1){
                    vm.callMethod('savePackage');
                }else if(data.data.status==2){
                    layer.open({
                        title:'提示',
                        content:'您有未完成的订单，请先完成或放弃该订单',
                        btn:['查看订单','放弃订单'],
                        yes:function(){
                            data.data.orderInfo.iccid=vm.get('userInfo').iccid;
                            vm.setStore('ORDER_INFO',data.data.orderInfo);
                            Jsborya.pageJump({
                                url:'orderInfo.html',
                                stepCode:'999',
                                depiction:'订单详情',
                                header:{
                                    frontColor:'#ffffff',
                                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
                                }
                            });
                        },
                        no:function(){
                            layer.closeAll();
                            vm.AJAX('/tas/w/business/orderCancell',{
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

            },true,function(){
                vm.set("off.load",false);
            });
        },
        savePackage:function(){
            
            vm.set("off.load",2);
            const cardInfo = vm.get('cardInfo'), packageInfo = vm.get('packageInfo');

            let selPackCodeArr = [];
            packageInfo.optPackList.forEach((item)=>{
                selPackCodeArr.push(item.code);
            })
            
            const json={
                params:{
                    phoneNum:cardInfo.phone,
                    imsi:vm.get('imsiInfo').imsi,
                    smsp:vm.get('imsiInfo').smsp,
                    packageCode:'',
                    selPackCode:selPackCodeArr.join('|'),
                    prestoreMoney:'',
                    belongType:1,
                },
                userInfo:vm.get('userInfo')
            };
            vm.AJAX('/tas/w/business/orderCreate',json,function(data){
                vm.set("off.load",false);
                data.data.iccid = vm.get('userInfo').iccid;
                vm.setStore('ORDER_INFO',data.data);
                
                Jsborya.pageJump({
                    url:'certification.html',
                    stepCode:'999',
                    depiction:'实名认证',
                    header:{
                        frontColor:'#ffffff',
                        backgroundColor:vm.getHeaderColor(cardInfo.deviceType),
                    }
                });
            },true,function(errorText){
                vm.error(errorText);
                vm.set("off.load",false);
            });
        },
        phoneFormat:function(phone){
            return vm.phoneFormat(phone);
        },
        mathCentToYuan:function(money){
            return vm.mathCentToYuan(money);
        },
        mathDiscount:function(money,discount){
            return vm.mathDiscount(money,discount);
        }
	}
});
});