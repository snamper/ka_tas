require('../../public.js');
require('./css/chengPackage.css');

Jsborya.ready(function(){

var vm=new Moon({
    el:'#app',
    data:{
        off:{//控制开关
            voice:0,//选中的语音资费
            pack:0,//选中的套餐
            pre:0,//选中的预存
            deductionUsed:1,//是否使用充值赠送余额
        },
        totalPrestoreMoney:0,
        existPrestoreMoney:0,
        differenceMoney:0,
        payMoney:'0.00',
        numberValue:'0.00',
        packageList:  [{
            "title": "--",
            "code": "0",
            "standard": "--",
            "feeDescribe": "--",
            "init": "1",
            "is4G": 0,
            "prompt": "--",
            "prestoreMoneyList": [{
                "title": "--",
                "info": "--",
                "prestoreMoney": "0",
                "discount": "0",
                "init": "1"
            }],
            "selPackage": [{
                "title": "--",
                "info": "--",
                "code": "0",
                "standard": "--",
                "feeDescribe": "--",
                "init": "1",
                "relevantListNums": "1",
                "relevantList": [{
                    "relevantOptPacks": "1",
                    "minNums": "1",
                    "maxNums": "2"
                }]
            }]
        }],
        changePackageInfo:{
            prestoreMoney:'0',
            packageCode:'0',
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
    },
    hooks:{
        init:function(){
            vm=this;
            Jsborya.setHeader({
                title:'变更套餐',
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

            let userInfo = vm.getStore('USER_INFO'),
                cardInfo = vm.getStore('CARD_INFO'),
                changePackageInfo = vm.getStore('CHANGE_PACKAGE_INFO');
            if(userInfo)vm.set('userInfo',userInfo);
            if(cardInfo)vm.set('cardInfo',cardInfo);
            if(changePackageInfo)vm.set('changePackageInfo',changePackageInfo);

            vm.callMethod('renderList');
            vm.callMethod('getList');
        }
    },
    methods:{
        getList:function(){//获取数据列表

            var json={
                'params':{
                    sourceOrder:vm.get('cardInfo').sourceOrder,
                    phoneNum:vm.get('cardInfo').phone,
                },
                'userInfo':vm.get('userInfo')
            };
            vm.AJAX('/tas/w/active/changePackList',json,function(data){
                let changePackageInfo = vm.get('changePackageInfo');

                for(let i=0,len=data.data.package.length;i<len;i++){
                    if(changePackageInfo.name && changePackageInfo.packageCode == data.data.package[i].code){
                        vm.set('off.pack',i);
                    }else if(data.data.package[i].init==1){
                        vm.set('off.pack',i);
                    }
                }

                vm.set('packageList',data.data.package);
                vm.callMethod('renderList');
            })
        },
        renderList:function(){//渲染可选包和预存
            var str = '',str2 = '',
                bagUl=document.getElementById('bagUl'),
                preUl=document.getElementById('preUl'),
                changePackageInfo = vm.get('changePackageInfo'),
                packageInfo=vm.get('packageList')[vm.get('off').pack];//选中de套餐

            //渲染可选包
            for(let i=0,todo=packageInfo.selPackage;i<todo.length;i++){
                if(changePackageInfo.name && changePackageInfo.packageCode == packageInfo.code && changePackageInfo.selPackageCode.indexOf(todo[i].code)>-1){//已选择变更的套餐
                    if(todo[i].init==2){
                        str+='<li class="active active2"';
                    }else{
                        str+='<li class="active"';
                    }
                }else if(changePackageInfo.name && changePackageInfo.packageCode == packageInfo.code){
                    str+='<li';
                }else{
                    if(todo[i].init==1){
                        str+='<li class="active"';
                    }else if(todo[i].init==2){
                        str+='<li class="active active2"';
                    }else str+='<li';
                }
                
                str+=' onclick="selectBag(this)" title="'+i+'">'+todo[i].title+'<span></span></li>';
            }
            if(bagUl) bagUl.innerHTML = str;
            //渲染预存
            for(let i=0,todo=packageInfo.prestoreMoneyList;i<todo.length;i++){
                let p_money=todo[i].prestoreMoney;

                if(changePackageInfo.name && changePackageInfo.packageCode == packageInfo.code){
                    if(p_money == changePackageInfo.prestoreMoney){
                        str2+='<li class="active"';
                        vm.set('off.pre',i);
                    }else str2+='<li'
                    
                }else{
                    if(todo[i].init==1){
                        str2+='<li class="active"';
                        vm.set('off.pre',i);
                    }else str2+='<li';
                }
                
                str2+=' onclick="selectPre(this)" title="'+i+'">'+parseInt(p_money)/100+'元<span></span></li>';
            }
            if(preUl) preUl.innerHTML = str2;
            str = '', str2 = '';  

            vm.callMethod('mathMoney');
        },
        mathMoney(){
            let existPrestoreMoney = vm.getUrlParam('prestoreMoney'),
                totalPrestoreMoney = vm.get('packageList')[vm.get('off').pack].prestoreMoneyList[vm.get('off').pre].prestoreMoney;

            vm.set('existPrestoreMoney',existPrestoreMoney);
            vm.set('differenceMoney',totalPrestoreMoney - existPrestoreMoney);
            vm.set('totalPrestoreMoney',totalPrestoreMoney);
        },
        selectPack:function(e){//套餐切换
            vm.set('off.pack',e.target.title);

            vm.callMethod('renderList');
            vm.callMethod('siblingC',[e.target]);
        },
        selectPackageInfo:function(){//套餐资费说明
            var packageInfo=vm.get('packageList')[vm.get('off').pack];

            layer.open({
                content:'<div class="select-info"><dl><dt>套餐名称</dt><dd class="b">'+packageInfo.title+'</dd></dl><dl><dt>资费说明</dt><dd>'+packageInfo.feeDescribe+'</dd></dl></div>',
                btn:['确定'],
                type:1,
                style:'width:90%;max-width:540px;top:-30px;',
            });
        },
        selectBag:function(e){//选择可选包
            var btn,name=e.title,isSelect;
            var selPackage=vm.get('packageList')[vm.get('off').pack].selPackage[name];
            
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
            vm.set('off.pre',e.title);
            vm.callMethod('siblingC',[e]);
            vm.callMethod('mathMoney');
        },
        filerSelectInfo:function(clickIndex,isSelect){//判断当前可选包选择状态
            let selPackage=vm.get('packageList')[vm.get('off').pack].selPackage;//当前所在的可选包组
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
                //  return val_i==val_j.code;
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
        cancelChange(){
            if(vm.get('changePackageInfo').packageCode == vm.get('packageList')[vm.get('off').pack].code)vm.removeStore('CHANGE_PACKAGE_INFO');
            Jsborya.pageBack({
                url:vm.get('cardInfo').bizType == 5 ? 'devotedWhitePackage.html' : `chengCardPackage.html?type=change`,
                isLoad:true
            });
        },
        makeSure:function(){//确定
            var selPackageCode=vm.callMethod('filterPreData'),
                packageInfo=vm.get('packageList')[vm.get('off').pack]

            vm.setStore('CHANGE_PACKAGE_INFO',{
                prestoreMoney:packageInfo.prestoreMoneyList[vm.get('off').pre].prestoreMoney,
                packageCode:packageInfo.code,
                selPackageCode:selPackageCode,
                name:packageInfo.title
            })
            Jsborya.pageBack({
                url:vm.get('cardInfo').bizType == 5 ? 'devotedWhitePackage.html' : `chengCardPackage.html?type=change`,
                isLoad:true
            });
        },
        filterPreData:function(){//获取选中的可以选包code
            var ret='',
                selPackage=vm.get('packageList')[vm.get('off').pack].selPackage,
                bagUl=document.getElementById('bagUl');
            for(let i=0;i<bagUl.childNodes.length;i++){
                if(bagUl.childNodes[i].nodeType===1&&bagUl.childNodes[i].className!=''){
                    let index=bagUl.childNodes[i].childNodes[0].title;
                    ret+=selPackage[i].code+'|';
                }
            }
            return ret.substring(0,ret.length-1);
        },
        siblingC:function(e){//同级元素，class切换
            var parent=e.parentNode;
            for(let i=0;i<parent.childNodes.length;i++){
                if(parent.childNodes[i].nodeType===1)parent.childNodes[i].className='';
            }
            e.className='active';
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

window.selectBag=function(e){
    vm.callMethod("selectBag",[e]);
};
window.selectPre=function(e){
    vm.callMethod("selectPre",[e]);
};

});