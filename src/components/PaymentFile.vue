<template>
<div>
    <State ref="fileState">
        <input type="file"
               v-on:input="changeFile"
               ref="file"
               class="form-control"/>
    </State>
    
    <template v-if="accounts.length">
    <div class="d-flex align-items-center">
        
        <div class="text-center font-weight-bold">Общая информация</div>
        
        <button @click="showInfo = showInfo ? false : true"
                class="flex-grow-0 m-1 btn btn-link btn-sm">
            <font-awesome-icon :icon="showInfo ? 'chevron-up' : 'chevron-down'"/>
        </button>
    </div>
    <table v-show="showInfo" class="table">
        <tr v-for="(val, key) in info">
            <td>{{ key }}</td>
            <td>{{ val }}</td>
        </tr>
    </table>
    
    <div v-for="(account, i) in accounts" class="border rounded">
        <Tab :accordionID="accordionID"
             :label="account['РасчСчет']"
             :visible="i==0">
            
            <div class="d-flex align-items-center">
                
                <div class="text-center font-weight-bold">Общая информация</div>
                
                <button @click="showAccountInfo(i)"
                        class="flex-grow-0 m-1 btn btn-link btn-sm">
                    <font-awesome-icon :icon="accountInfo[i] ? 'chevron-up' : 'chevron-down'"/>
                </button>
            </div>
            <table v-show="accountInfo[i]" class="table">
                <template v-for="(val, key) in account">
                    <tr v-if="key != 'docs'">
                        <td>{{ key }}</td>
                        <td>{{ val }}</td>
                    </tr>
                </template>
            </table>
            
            <div class="text-center font-weight-bold m-2">Платежи</div>
            
            <div v-for="doc in account.docs" class=" p-2">
            <table class="table border rounded">
                <tr v-if="doc['Дата']">
                    <td>Дата</td><td>{{ doc['Дата'] }}</td>
                </tr>
                <tr v-if="doc['Номер']">
                    <td>Номер</td><td>{{ doc['Номер'] }}</td>
                </tr>
                <tr v-if="doc['Сумма']">
                    <td>Сумма</td><td>{{ doc['Сумма'] }}</td>
                </tr>
                <tr v-if="doc['type']">
                    <td>Тип</td><td>{{ doc['type'] }}</td>
                </tr>
                <tr v-if="doc['НазначениеПлатежа']">
                    <td>Назначение Платежа</td><td>{{ doc['НазначениеПлатежа'] }}</td>
                </tr>
            </table>
            </div>
            
        </Tab>
    </div>
    </template>
</div>
</template>

<script>

import Vue from 'vue';
    
import State from './State.vue';
    
import Tab from './ObjectContent/Tab.vue';
    
export default {
    components:
    {
        State, Tab
    },
    data: function()
    {
        return {
            info: {},
            showInfo: false,
            accounts: [],
            accountInfo: [],
            accordionID: "id"+(""+Math.random()).substring(2)
        };
    },
    methods:
    {
        showAccountInfo(i)
        {
            Vue.set(this.accountInfo, i, (this.accountInfo[i]) ? false : true);
        },
        changeFile()
        {
            let files = this.$refs.file.files;
            let change = this.$refs.fileState.change;
            let parse = this.parseFile;
            
            if(files.length)
            {
                var reader = new FileReader();
                
                reader.onload = function(event) {
                    
                    
                    
                    parse(event.target.result);
                    
                    //var contents = event.target.result;
                    //console.log("Содержимое файла: " + contents);
                    console.log("done");
                    change("show");
                };

                reader.onerror = function(event) {
                    
                    change("error", "Файл не может быть прочитан! код " + event.target.error.code);
                    
                    console.error("Файл не может быть прочитан! код " + event.target.error.code);
                };
                
                change("changing", "Чтение файла");

                reader.readAsText(files[0], 'windows-1251');
            }
        },
        parseFile(text)
        {
            console.log(text);
            let strings = text.split('\n');
            
            this.info = {};
            this.accounts = [];
            
            let account = undefined, doc = undefined;
                        
            strings.forEach((str) => {
                
                if(str.length && str.charCodeAt(str.length-1) == 13)//перенос строки в 2 символа, коды 13 и 10
                {
                    str = str.substr(0, str.length-1);
                }
                
                let i = str.indexOf("=");
                
                if(i == -1) i = str.length;
                
                let key = str.substr(0, i), val;
                
                if(i < str.length) val = str.substr(i+1);
                
                
                if(key == "РасчСчет" && account === undefined)
                {
                    console.log("!");
                    account = {"РасчСчет": val, docs: []};
                }
                else if(key == "КонецРасчСчет")
                {
                    console.log("!");
                    this.accounts.push(account);
                    account = undefined;
                }
                else if(key == "СекцияДокумент")
                {
                    console.log("!");
                    doc = {type: val};
                }
                else if(key == "КонецДокумента")
                {
                    console.log("!");
                    let last = this.accounts.length - 1;
                    if(last >= 0) this.accounts[last].docs.push(doc); 
                    doc = undefined;
                }
                else if(val !== undefined)
                {
                    if(account) account[key] = val;
                    else if(doc) doc[key] = val;
                    else this.info[key] = val;
                }
            });
            
            console.log(this.accounts);
        }
    }
}
</script>