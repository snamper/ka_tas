require('../../public.js');
require('./css/whitePackage.css');

Jsborya.ready(function(){

var vm=new Moon({
	el:'#app',
	data:{
		off:{//控制开关
			voice:0,//选中的语音资费
			flow:0,//选中的流量档位
			pre:0,//选中的预存
			deductionUsed:1,//是否使用充值赠送余额
			flowType:1,//流量挡位切换
			onlyFlowType:0,//只存在的流量挡位type,3表示包含1，2
			addPre:999,
		},
		addPrestoreList:[30,50,100,200,300],
        inputAddPre:'',//输入的首充
        addPreMoney:'0.00',//首充金额
        addPreDiscountMoney:'0.00',//首充折扣后金额
		prestoreMoney:'0.00',
		totalMoney:'0.00',
		deductionMoney:'0.00',
		payMoney:'0.00',
		packageInfo: {
	        "fareMore": 0,
	        "numberLevel": 0,
	        "cityName": "--",
            "addPreDiscount":"10000",
            "deductionFee":0,//充值赠送余额
	        "fareList": [
	            {
	                "init": 1,
	                "phoneFareVal": "暂无语音资费",
	                "phoneFareCode": "0",
	                "flowList": [
	                    {
	                        "init": 1,
	                        "package": "0",
	                        "phoneFlowCode": "0",
	                        "phoneFlowVal": "暂无流量档位",
	                        "flowType":"1",
	                        "lowestPay": "0",
	                        "prompt": "",
	                        "prettyPrestoreMoney": "0",
	                        "selPackageMore": 0,
	                        "packageInfo": {
	                            "standard": "--",
	                            "code": "0",
	                            "title": "暂无套餐",
	                            "internetTime": "0",
	                            "feeDescribe": "--",
	                            "isFour": "0",
	                            "prompt": "",
	                            "selPackage": [
	                                {
	                                    "standard": "--",
	                                    "init": 1,
	                                    "feeDescribe": "暂无可选包",
	                                    "code": "0",
	                                    "title": "漏电提醒"
	                                }
	                            ],
	                            "prestoreMoneyList": [
	                                {
	                                    "init": "1",
	                                    "title": "",
	                                    "prestoreMoney": "0",
	                                    "info": ""
	                                }
	                            ]
	                        }
	                    }
	                ]
	            }
	        ]
	    },
	    cardInfo:{
            iccid:'',
            sourceOrder:'',
            phone:'',
            belongType:'0',
            bizType:'4',
            faceMoney:'0',
        },
	    prestoreMoneyList:[],
	    selPackage:[],
        userInfo:{},
        flowTx:'transform:translate3d(63px,0,0)',//流量切换偏移x
	},
	hooks:{
        init:function(){
        	vm=this;
	        Jsborya.webviewLoading({isLoad:false});//关闭app加载层
	        vm.callMethod('renderList');

	        let cardInfo = vm.getStore('CARD_INFO'),
	        	userInfo = vm.getStore('USER_INFO');
            if(cardInfo)vm.set('cardInfo',cardInfo);
            if(userInfo)vm.set('userInfo',userInfo);

            vm.callMethod('getPackageInfo');
		}
	},
	methods:{
		getPackageInfo:function(){//获取数据列表
			const json={
	  			'params':{
                    sourceOrder:vm.get('cardInfo').sourceOrder,
                    phoneNum:vm.get('cardInfo').phone
                },
	  			'userInfo':vm.get('userInfo')
	  		};

			vm.AJAX('/tas/w/active/changePackList',json,function(data){
				for(let i=0,len=data.data.fareList.length;i<len;i++){
					if(data.data.fareList[i].init==1){
						vm.set('off.voice',i);
						for(let j=0,lenj=data.data.fareList[i].flowList.length;j<lenj;j++){
							if(data.data.fareList[i].flowList[j].init==1){
								vm.set('off.flow',j);
								break;
							}
						}
					}
				}
				vm.callMethod('pickOnlyFlowType',[data.data.fareList[vm.get('off').voice].flowList]);
				vm.set('packageInfo',data.data);
				vm.callMethod('renderList');
			})
		},
		renderList:function(){//渲染可选包和预存
			var vm = this, str = '',str2 = '',
				bagUl=document.getElementById('bagUl'),
				preUl=document.getElementById('preUl'),
				packageInfo=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo;//选中de套餐

			//渲染可选包
			for(let i=0,todo=packageInfo.selPackage;i<todo.length;i++){
				if(todo[i].init==1){
					str+='<li class="active"';
				}else if(todo[i].init==2){
					str+='<li class="active active2"';
				}else str+='<li';
				str+=' onclick="selectBag(this)" title="'+i+'">'+todo[i].title+'<span></span></li>';
			}

			if(bagUl) bagUl.innerHTML = str;
			//渲染预存
			for(let i=0,todo=packageInfo.prestoreMoneyList;i<todo.length;i++){
				var p_money=parseInt(todo[i].prestoreMoney)/100;
				if(todo[i].init==1){
					str2+='<li class="active"';
					vm.set('off.pre',i);
				}else str2+='<li';
				str2+=' onclick="selectPre(this)" title="'+i+'">'+p_money+'元<span></span></li>';
			}
			if(preUl) preUl.innerHTML = str2;

			str = '', str2 = '';

			if(vm.get('packageInfo').deductionFee==0){//充值赠送余额
				vm.set('off.deductionUsed',false);
			}else vm.get('off.deductionUsed',true);
			
			vm.callMethod('mathDeduction');
			
		},
		mathDeduction:function(e){//计算金额
			var vm=this,
				prestoreMoney,//预存
				totalMoney,//总价格
				deductionMoney,//抵扣预存金额
				payMoney,//支付金额
				addPreMoney = 0,//首充金额
                addPreDiscountMoney = 0,//首充折扣后金额
				faceMoney=parseFloat(vm.get('cardInfo').faceMoney),//号码占用费
				giveAccount=0;//充值赠送账户
			prestoreMoney=parseFloat(vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo.prestoreMoneyList[vm.get('off').pre].prestoreMoney);
				
			if(vm.get('off').addPre == 998){//手动输入首充金额
                addPreMoney = parseFloat(vm.get('inputAddPre')) * 100;
            }else if(vm.get('off').addPre != 999){//选择的首充金额
                addPreMoney = parseFloat(vm.get('addPrestoreList')[vm.get('off').addPre]) * 100
            }
            addPreDiscountMoney = addPreMoney * parseFloat(vm.get('packageInfo').addPreDiscount) / 10000;

            totalMoney=faceMoney + prestoreMoney + addPreDiscountMoney;

			if(e){//点击事件触发
				vm.get('off').deductionUsed ? vm.get('off').deductionUsed=false : vm.get('off').deductionUsed=true;
			}

			if(vm.get('off').deductionUsed){
				if(faceMoney<0){
					if(giveAccount>totalMoney){
						deductionMoney=totalMoney;
					}else if(0<giveAccount<=totalMoney){
						deductionMoney=giveAccount;
					}else deductionMoney=0;
				}else{
					if(giveAccount>prestoreMoney){
						deductionMoney=prestoreMoney;
					}else if(0<giveAccount<=prestoreMoney){
						deductionMoney=giveAccount;
					}
				}
				
				payMoney=totalMoney-deductionMoney;//支付价格
			}else{
				deductionMoney=0;
				payMoney=totalMoney;
			}
			
			vm.set('prestoreMoney',vm.mathCentToYuan(prestoreMoney));
            vm.set('totalMoney',vm.mathCentToYuan(totalMoney));
            vm.set('deductionMoney',vm.mathCentToYuan(deductionMoney));
            vm.set('addPreMoney',vm.mathCentToYuan(addPreMoney));
            vm.set('addPreDiscountMoney',vm.mathCentToYuan(addPreDiscountMoney));
            vm.set('payMoney',vm.mathCentToYuan(payMoney));
		},
		selectVoice:function(e){//语音切换
			vm.set('off.voice',e.target.title);
			let flowList=vm.get('packageInfo').fareList[vm.get('off').voice].flowList;
			for(let j=0,lenj=flowList.length;j<lenj;j++){
				if(flowList[j].init==1){
					vm.set('off.flow',j);
					break;
				}else vm.set('off.flow',0);
			}

			vm.callMethod('pickOnlyFlowType',[flowList]);

			vm.callMethod('renderList');
			vm.callMethod('siblingC',[e.target]);
			vm.callMethod('mathDeduction');
		},
		selectFlow:function(e){//流量切换
			vm.set('off.flow',e.target.title);
			vm.callMethod('renderList');
			vm.callMethod('siblingC',[e.target]);
			vm.callMethod('mathDeduction');
		},
		selectPackageInfo:function(e){//套餐资费说明
			var packageInfo=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo;
			layer.open({
				content:'<div class="select-info"><dl><dt>套餐名称</dt><dd class="b">'+packageInfo.title+'</dd></dl><dl><dt>资费说明</dt><dd>'+packageInfo.feeDescribe+'</dd></dl></div>',
				btn:['确定'],
				type:1,
				style:'width:90%;max-width:540px;top:-30px;',
			});
		},
		selectBag:function(e){//选择可选包
			var btn,name=e.title,isSelect;
			var selPackage=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo.selPackage[name];
			
			if(selPackage.init==2){
				var result={type:'NOT_OPTIONAL'};
			}else{
				if(e.className=='active'){
					isSelect=true;
				}else{
					isSelect=false;
				}
				var result=vm.callMethod('filerSelectInfo',[name,isSelect]);
			}


			if(result.type=='SELECT'){
				btn=['选择','关闭'];
			}else if(result.type=='NOT_SELECT'){
				btn=['不选择','关闭'];
			}else if(result.type=='NOT_OPTIONAL'){
				btn=['关闭'];
			}else btn=['选择','关闭'];

			layer.open({
				content:'<div class="select-info"><dl><dt>套餐名称</dt><dd class="b">'+selPackage.title+'</dd></dl><dl><dt>资费标准</dt><dd>'+selPackage.standard+'</dd></dl><dl><dt>资费说明</dt><dd>'+selPackage.feeDescribe+'</dd></dl></div>',
				btn:btn,
				type:1,
				style:'width:90%;max-width:540px;top:-30px;',
				yes:function(){
					if(result.type=='SELECT'){
						e.className='active';
					}else if(result.type=='NOT_SELECT'){
						e.className='';
					}
					if(typeof result.callback=='function')result.callback();
					layer.closeAll();
				},
				no:function(){
					layer.closeAll();
				}
			})
		},
		selectPre:function(e){//预存切换
			vm.set('off.pre',e.target.title);
			vm.callMethod('siblingC',[e]);
			vm.callMethod('mathDeduction');
		},
		pickOnlyFlowType(list){//获取流量挡位type
			let flowTypeStr='';
			list.forEach((val)=>{
				flowTypeStr+=val.flowType+','
			})

			if(flowTypeStr.indexOf(0)>-1){
				vm.set('off.onlyFlowType',0);
				vm.set('off.flowType',0);
			}else if(flowTypeStr.indexOf(1)==-1){
				vm.set('off.onlyFlowType',2);
				vm.set('off.flowType',2);
			}else if(flowTypeStr.indexOf(2)==-1){
				vm.set('off.onlyFlowType',1);
				vm.set('off.flowType',1);
			}else{
				vm.set('off.onlyFlowType',3);
				vm.set('off.flowType',1);
			}
		},
		filerSelectInfo:function(clickIndex,isSelect){//判断当前可选包选择状态
			let selPackage=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo.selPackage;//当前所在的可选包组
			let bagUl=document.getElementById('bagUl');
			let selectedArr=[];//当前已选中的所有可选包
			let ruleSelected=[];//规则内已选
			let ruleNoSelect=[];//规则内未选
			if(selPackage[clickIndex].relevantList[0]){
				var ruleStr=selPackage[clickIndex].relevantList[0].relevantOptPacks+','+selPackage[clickIndex].code;//组装规则
			}else if(isSelect){
				return {type:'NOT_SELECT'};
			}else return {type:'SELECT'};
			let ruleCodeArr=ruleStr.split(',');//规则内的code
			let min=parseInt(selPackage[clickIndex].relevantList[0].minNums);//最小可选数
			let max=parseInt(selPackage[clickIndex].relevantList[0].maxNums);//最大可选数

			//获取已选中的所有可选包
			for(let i=0;i<bagUl.childNodes.length;i++){
				if(bagUl.childNodes[i].nodeType===1&&bagUl.childNodes[i].className!=''){
					let index=bagUl.childNodes[i].childNodes[0].title;
					selectedArr.push({code:selPackage[i].code,key:i});
				}
			}
			//获取规则内已选和未选

			ruleCodeArr.forEach((val_i,i)=>{
				// let c=selectedArr.findIndex((val_j,j)=>{兼容问题放弃此写法
				// 	return val_i==val_j.code;
				// });
				let c = -1;
				for(let j = 0,len = selectedArr.length;j<len;j++){
					if(val_i==selectedArr[j].code){
						c = j;
						break;
					}
				}
				
				if(c!=-1){
					ruleSelected.push(selectedArr[c]);
				}else{
					ruleNoSelect.push({code:ruleCodeArr[i]});
				}
			});

			//获取规则内未选的key
			selPackage.forEach((val_i,i)=>{
				ruleNoSelect.forEach((val_j,j)=>{
					if(val_j==val_i)ruleNoSelect[j].key=i;
				});
			});
			//console.log(ruleSelected,ruleNoSelect,ruleCodeArr);
			let selectNums=ruleSelected.length;//已选中数

			if(min==0){
				if(isSelect){
					return {type:'NOT_SELECT'};
				}else{
					if(selectNums>=max){
						return {type:'NOT_OPTIONAL'};
					}else return {type:'SELECT'};
				}
			}else if(min==max){
				if(isSelect){
					if(selectNums>=max){
						return {type:'NOT_OPTIONAL'};
					}else return {
						type:'NOT_SELECT',
						callback:function(){
							for(let i=0;i<max;i++){
								vm.callMethod('setClass',[ruleNoSelect[i].key,1]);
							}
						}
					}
					
				}else return {
						type:'SELECT',
						callback:function(){
							vm.callMethod('setClass',[ruleSelected[0].key,2]);
						}
					}
			}else if(max>min){
				if(selectNums==min){
					if(isSelect){
						return {type:'NOT_OPTIONAL'};
					}else return {type:'SELECT'};
				}else if(selectNums>min&&selectNums<max){
					if(isSelect){
						return {type:'NOT_SELECT'};
					}else return {type:'SELECT'};
				}else if(selectNums==max){
					if(isSelect){
						return {type:'NOT_SELECT'};
					}else return {
							type:'SELECT',
							callback:function(){
								vm.callMethod('setClass',[ruleSelected[0].key,2]);
							}
						}
				}else return {type:'NOT_OPTIONAL'};
			}
		},
		setClass:function(index,type){//设置在index位置的元素,type:1,新增class;2,移除class
			let bagUl=document.getElementById('bagUl');
			for(let i=0;i<bagUl.childNodes.length;i++){
				if(bagUl.childNodes[i].nodeType===1&&index==i){
					if(type==1)bagUl.childNodes[i].className='active';
					if(type==2)bagUl.childNodes[i].className='';
				}
			}
		},
        makeSure:function(){//读取证件信息
			if(vm.get('cardInfo').card=="0000000000"  || !vm.callMethod('checkAddPre'))return false;

            var selPackageCode=vm.callMethod('filterPreData'),
            	packageInfo=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo;


            let addPre = 0;
            if(vm.get('off').addPre == 998){
                addPre = vm.get('inputAddPre') ? vm.get('inputAddPre') * 100 : 0;
            }else if(vm.get('off').addPre != 999){
                addPre = vm.get('addPrestoreList')[vm.get('off').addPre]*100;
            }

            const json={
                'params':{
                    'prestoreMoney':packageInfo.prestoreMoneyList[vm.get('off').pre].prestoreMoney,
                    'packageCode':packageInfo.code,
                    'selPackageCode':selPackageCode,
                    'deductionType':vm.get('off').deductionUsed ? '1' : '0',//是否使用赠送金额
                    'sourceOrder':vm.get('cardInfo').sourceOrder,
                    'belongType':vm.get('cardInfo').belongType,
                    'deviceType':'1',
                    'phoneNum':vm.get('cardInfo').phone,
                    'addPre':addPre.toString(),
                    'safeCode':'',
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
		filterPreData:function(){//获取选中的可以选包code
			var ret='',
				selPackage=vm.get('packageInfo').fareList[vm.get('off').voice].flowList[vm.get('off').flow].packageInfo.selPackage,
			bagUl=document.getElementById('bagUl');
			for(let i=0;i<bagUl.childNodes.length;i++){
				if(bagUl.childNodes[i].nodeType===1&&bagUl.childNodes[i].className!=''){
					let index=bagUl.childNodes[i].childNodes[0].title;
					ret+=selPackage[i].code+'|';
				}
			}
			return ret.substring(0,ret.length-1);
		},
		shiftFlowType(type){
			vm.set('off.flowType',type);

			setTimeout(function(){
				let flowLevelChildren=document.getElementById('flowLevel').childNodes,firsthild;

				for(let i=0,len=flowLevelChildren.length;i<len;i++){
					if(flowLevelChildren[i].nodeType===1){
						firsthild=flowLevelChildren[i];
						break;
					}
				}
				vm.callMethod('selectFlow',[{target:firsthild}])
			},0)
			if(type==2){
				vm.set('flowTx',`transform:translate3d(0,0,0)`);
			}else if(type==1){
				vm.set('flowTx',`transform:translate3d(63px,0,0)`);
			}
		},
		siblingC:function(e){//同级元素，class切换
			var parent=e.parentNode;
			for(let i=0;i<parent.childNodes.length;i++){
				if(parent.childNodes[i].nodeType===1)parent.childNodes[i].className='';
			}
			e.className='active';
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
        mathDiscount:function(money,discount){
            return vm.mathDiscount(money,discount);
        },
        phoneFormat:function(phone){
            return this.phoneFormat(phone);
        },
        mathCentToYuan:function(value){
            return this.mathCentToYuan(value);
        },
	}
});
window.selectBag=function(e){
    vm.callMethod("selectBag",[e]);
};
window.selectPre=function(e){
    vm.callMethod("selectPre",[e]);
};
});