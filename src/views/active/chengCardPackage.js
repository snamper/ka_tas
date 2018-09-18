require('../../public.js');
require('./css/chengPackage.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{//控制开关
			addPre:999,
            deductionUsed:true,
		},
        addPrestoreList:[30,50,100,200,300],
        differenceMoney:'0.00',//补差价
        deductionMoney:'0.00',//抵扣预存金额
        shouldPayMoney:'0.00',//应付
        addPreMoney:'0.00',//首充金额
        addPreDiscountMoney:'0.00',//首充折扣后金额
        payMoney:'0.00',//支付金额
        inputAddPre:'',//输入的首充
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
            deductionFee:"0",
            numberValue:"0",
            addPreDiscount:"10000",
            safeCheck:"0",//1发送短信验证0不发送
            checkPhone:'',
        },
        changePackageInfo:{
            prestoreMoney:'0',
            packageCode:'',
            selPackageCode:'',
            name:''
        },
        cardInfo:{
            iccid:'',
            sourceOrder:'',
            phone:'',
            belongType:'0',
            bizType:'4',
            faceMoney:'0',
        },
        userInfo:{},
        inputSafeCode:'',//输入的验证码
        safeCodeCount:0,
        checkTime:0,
	},
    hooks:{
        init:function(){
            vm=this;
            Jsborya.setHeader({
                title:'套餐详情',
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

            let type = vm.getUrlParam('type'),
                cardInfo = vm.getStore('CARD_INFO'),
                userInfo = vm.getStore("USER_INFO"),
                changePackageInfo = vm.getStore('CHANGE_PACKAGE_INFO');
            alert(`type:${type}`)
            alert(`changePackageInfo:${JSON.stringify(changePackageInfo)}`)
            if(cardInfo)vm.set('cardInfo',cardInfo);
            if(userInfo)vm.set('userInfo',userInfo);
            if(type == 'change' && changePackageInfo){//判断是从变更套餐返回
                vm.set('changePackageInfo',changePackageInfo);
            }else vm.removeStore('CHANGE_PACKAGE_INFO');//从卡激活扫码进入

            vm.callMethod('getPackageInfo');
        }
    },
	methods:{
		getPackageInfo(){
			const json={
	  			params:{
                    sourceOrder:vm.get('cardInfo').sourceOrder,
                    phoneNum:'',
	  			},
	  			userInfo:vm.get('userInfo')
	  		};

			vm.AJAX('/tas/w/active/defaultInfo',json,function(data){
				vm.set('packageInfo',data.data);
                vm.set('checkTime',parseInt(data.data.validTime)/60 || 20);
                vm.callMethod('mathDeduction');
			})
		},
		makeSure(){//读取证件信息

            let changePackageInfo = vm.get('changePackageInfo'),
                packageInfo = vm.get('packageInfo');
            
			if(!vm.get('cardInfo').sourceOrder || !vm.callMethod('checkAddPre'))return false;
            if(packageInfo.safeCheck == 1 && !vm.get('inputSafeCode')){
                layer.open({
                    content:'请输入激活码',
                    skin: "msg",
                    msgSkin:'error',
                    time: 4
                });
                return false;
            }

            let addPre = 0;
            if(vm.get('off').addPre == 998){
                addPre = vm.get('inputAddPre') ? vm.get('inputAddPre') * 100 : 0;
            }else if(vm.get('off').addPre != 999){
                addPre = vm.get('addPrestoreList')[vm.get('off').addPre]*100;
            }


            const json={
                'params':{
                    'prestoreMoney':changePackageInfo.prestoreMoney,
                    'packageCode':changePackageInfo.packageCode,
                    'selPackageCode':changePackageInfo.selPackageCode,
                    'deductionType':vm.get('off').deductionUsed ? '1' : '0',//是否使用赠送金额
                    'sourceOrder':vm.get('cardInfo').sourceOrder,
                    'belongType':vm.get('cardInfo').belongType,
                    'deviceType':'1',
                    'phoneNum':packageInfo.phoneNum,
                    'addPre':addPre.toString(),
                    'safeCode':vm.get('inputSafeCode'),
                    'imsi':'',
                    'smsp':'',
                },
                'userInfo':vm.get('userInfo')
            };

            vm.AJAX('/tas/w/active/setCardInfo',json,function(data){
                vm.setStore('ORDER_INFO',data.data);

                Jsborya.pageJump({
                    url:'certification.html',
                    stepCode:'999',
                    depiction:'实名认证',
                    header:{
                        frontColor:'#ffffff',
                        backgroundColor:'#4b3887',
                    }
                });
            });
		},
        mathDeduction:function(e){//计算金额
            var vm=this,
                differenceMoney = 0,//补差价
                deductionMoney = 0,//抵扣预存金额
                shouldPayMoney = 0,//应付
                addPreMoney = 0,//首充金额
                addPreDiscountMoney = 0,//首充折扣后金额
                payMoney = 0,//支付金额
                existPrestoreMoney = parseFloat(vm.get('packageInfo').prestoreMoney),//已有预存
                giveAccount=0;//充值赠送账户

            if(e){//点击事件触发
                vm.get('off').deductionUsed ? vm.get('off').deductionUsed=false : vm.get('off').deductionUsed=true;
            }

            if(vm.get('changePackageInfo').name){//更换了套餐
                differenceMoney = parseFloat(vm.get('changePackageInfo').prestoreMoney) - existPrestoreMoney;
            }
            if(vm.get('off').deductionUsed){
                if(giveAccount>differenceMoney){
                    deductionMoney=differenceMoney;
                }else if(0<giveAccount<=differenceMoney){
                    deductionMoney=giveAccount;
                }
            }else{
                deductionMoney=0;
            }
            shouldPayMoney = differenceMoney - deductionMoney;

            if(vm.get('off').addPre == 998){//手动输入首充金额
                addPreMoney = parseFloat(vm.inputAddPre) * 100;
            }else if(vm.get('off').addPre != 999){//选择的首充金额
                addPreMoney = parseFloat(vm.get('addPrestoreList')[vm.get('off').addPre]) * 100
            }
            addPreDiscountMoney = addPreMoney * parseFloat(vm.get('packageInfo').addPreDiscount) / 10000;


            payMoney = shouldPayMoney + addPreDiscountMoney;
            
            vm.set('differenceMoney',vm.mathCentToYuan(differenceMoney));
            vm.set('deductionMoney',vm.mathCentToYuan(deductionMoney));
            vm.set('shouldPayMoney',vm.mathCentToYuan(shouldPayMoney));
            vm.set('addPreMoney',vm.mathCentToYuan(addPreMoney));
            vm.set('addPreDiscountMoney',vm.mathCentToYuan(addPreDiscountMoney));
            vm.set('payMoney',vm.mathCentToYuan(payMoney));
        },
        shiftAddPrestore(index){
            if(index == vm.get('off').addPre && index != 998){
                vm.set('off.addPre',999);
            }else{
                vm.set('off.addPre',index);
            }

            vm.callMethod('mathDeduction');
        },
        inputAddPreChange(){
            setTimeout(()=>{
                vm.callMethod('checkAddPre');
                vm.callMethod('mathDeduction');
            },800)
        },
        checkAddPre(){
            let val = vm.get('inputAddPre').toString();
            if(val.length>0 && this.off.addPre == 998){
                val = parseInt(val);

                // if(val % 10 != 0){
                //     layer.open({
                //         content:'请输入10的倍数',
                //         skin: "msg",
                //         msgSkin:'error',
                //         time: 2
                //     });
                //     this.inputAddPre = '';
                //     return false;
                // }else 
                if(val < 30){
                    layer.open({
                        content:'最小为30元',
                        skin: "msg",
                        msgSkin:'error',
                        time: 2
                    });
                    vm.set('inputAddPre','');
                    return false;
                }else if(val > 10000){
                    layer.open({
                        content:'最大为10000元',
                        skin: "msg",
                        msgSkin:'error',
                        time: 2
                    });
                    vm.set('inputAddPre','');
                    return false;
                }
            }
            return true;
        },
        jumpChangeList(){

            Jsborya.pageJump({
                url:`changePackageList.html?prestoreMoney=${vm.get('packageInfo').prestoreMoney}`,
                stepCode:'999',
                destroyed:false,
                depiction:'开成卡-套餐变更',
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
        },
        jumpPackageDetails(){
            vm.setStore('PACKAGE_DETAILS',vm.get('packageInfo'));

            Jsborya.pageJump({
                url:"packageDetails.html",
                stepCode:'999',
                destroyed:false,
                depiction:'套餐详情',
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
        },
        getSafeCode(){
            const vm=this;

            let json={
                params:{
                    adultOrder:vm.get('cardInfo').sourceOrder,
                },
                userInfo:vm.get('userInfo')
            };

            vm.AJAX('/tas/w/active/sendCode',json,function(data){
                vm.callMethod('countDown',[parseInt(vm.get('checkTime'))*60]);
            });
        },
        countDown(count){
          const vm=this;

          vm.set('safeCodeCount',count);
          window.Timer=setInterval(()=>{
            let t=vm.get('safeCodeCount');
            if(!t){
              clearInterval(window.Timer);
              return false;
            }
            t--;
            vm.set('safeCodeCount',t);
          },1000);
        },
        secondsFormat(v=0){
            v=parseInt(v);
            var day,minute,second,hour;
            day=Math.floor(v/(60*60*24));
            hour=Math.floor(v%(60*60*24)/(60*60));
            minute=Math.floor(v%(60*60)/60);
            second=Math.floor(v%60);
            hour<10&&(hour='0'+hour);
            minute<10&&(minute='0'+minute);
            second<10&&(second='0'+second);
            return day!='00' ? day+"天"+hour+":"+minute+":"+second : 
                hour!='00' ? hour+":"+minute+":"+second : 
                minute!='00' ? minute+":"+second : "00:"+second;
        },
        addAsterisk(str,begin,stop){
          let rep=str.substring(begin,stop);
          return str.replace(new RegExp(rep,'g'),'*'.repeat(stop-begin));
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
	}
});
});