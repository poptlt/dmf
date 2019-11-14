<template>
<div>
<State ref="state">
    
    <input v-if="!submitted"
           type="file"
           v-on:input="changeFile"
           ref="file"
           class="form-control"/>
    
    <template v-if="accounts.length">
        
    <center v-if="!submitted">
        <button @click="sendFile" class="btn btn-primary">Записать</button>
    </center>
        
    <template v-if="submitted">
        
        <div class="text-center font-weight-bold">Нераспознанные платежи</div>
        
        <div v-for="doc in unrecognized" class="p-2">
        <table class="table border rounded">
            <tr>
                <td>Счет</td><td>{{ doc.account }}</td>
            </tr>
            <tr v-if="doc['Дата']">
                <td>Дата</td><td>{{ doc['Дата'] }}</td>
            </tr>
            <tr v-if="doc['Номер']">
                <td>Номер</td><td>{{ doc['Номер'] }}</td>
            </tr>
            <tr v-if="doc['Сумма']">
                <td>Сумма</td><td>{{ doc['Сумма'] }}</td>
            </tr>
            <tr v-if="doc['ТипДокумента']">
                <td>Тип</td><td>{{ doc['ТипДокумента'] }}</td>
            </tr>
            <tr v-if="doc['НазначениеПлатежа']">
                <td>Назначение Платежа</td><td>{{ doc['НазначениеПлатежа'] }}</td>
            </tr>
            <tr>
                <td colspan="2" class="p-1 text-center">
                    <button @click="showDoc(doc.Doc)"
                            class="btn btn-primary btn-sm">
                        Редактировать
                    </button>
                </td>
            </tr>
        </table>
        </div>
    </template>
        
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
                
                <div class="text-center font-weight-bold">Информация по счету</div>
                
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
                <tr v-if="doc['ТипДокумента']">
                    <td>Тип</td><td>{{ doc['ТипДокумента'] }}</td>
                </tr>
                <tr v-if="doc['НазначениеПлатежа']">
                    <td>Назначение Платежа</td><td>{{ doc['НазначениеПлатежа'] }}</td>
                </tr>
                <tr v-if="doc.Doc">
                    <td colspan="2" class="p-1 text-center">
                        <button @click="showDoc(doc.Doc)"
                                class="btn btn-primary btn-sm">
                            Редактировать
                        </button>
                    </td>
                </tr>
            </table>
            </div>
            
        </Tab>
    </div>
    </template>

</State>
</div>
</template>

<script>

import { mapActions } from 'vuex';
    
import Vue from 'vue';
    
import State from './State.vue';
    
import Tab from './ObjectContent/Tab.vue';
    
export default {
    props: ["addPanel"],
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
            accordionID: "id"+(""+Math.random()).substring(2),
            
            submitted: false,
            unrecognized: []
        };
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        showAccountInfo(i)
        {
            Vue.set(this.accountInfo, i, (this.accountInfo[i]) ? false : true);
        },
        showDoc({DocID, Name, Object})
        {
            this.addPanel("BankPayment", Name, {DocumentID: DocID, FirmID: Object.FirmID});
        },
        changeFile()
        {
            let files = this.$refs.file.files;
            let change = this.$refs.state.change;
            let parse = this.parseFile;
            
            if(files.length)
            {
                var reader = new FileReader();
                
                reader.onload = function(event) {
                    
                    parse(event.target.result);
                    
                    change("show");
                };

                reader.onerror = function(event) {
                    
                    change("error", "Файл не может быть прочитан! код " + event.target.error.code);
                };
                
                change("changing", "Чтение файла");

                reader.readAsText(files[0], 'windows-1251');
            }
            else this.accounts = [];
        },
        parseFile(text)
        {
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
                    account = {"РасчСчет": val, docs: []};
                }
                else if(key == "КонецРасчСчет")
                {
                    this.accounts.push(account);
                    account = undefined;
                }
                else if(key == "СекцияДокумент")
                {
                    doc = {"ТипДокумента": val};
                }
                else if(key == "КонецДокумента")
                {
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
            
            this.accounts.forEach((account) => {
                
                function compare(doc1, doc2)
                {
                    let keys = ["ТипДокумента", "ПлательщикСчет", "Дата", "Номер"];
                    
                    for(let i=0; i<keys.length; i++)
                    {
                        let key = keys[i];
                        if(doc1[key] < doc2[key]) return -1;
                        if(doc1[key] > doc2[key]) return 1;
                    }
                    
                    return 0;
                }
                
                account.docs.sort(compare);
                
                account.docs[0]["ПорядковыйНомер"] = 0;
                
                for(let i=1; i<account.docs.length; i++)
                {
                    if(compare(account.docs[i-1], account.docs[i]) == 0)
                    {
                        account.docs[i]["ПорядковыйНомер"] = account.docs[i-1]["ПорядковыйНомер"] + 1;
                    }
                    else account.docs[i]["ПорядковыйНомер"] = 0;
                }
            });
            
            console.log(this.accounts);
        },
        sendFile()
        {
            let toServer = [];
            
            this.accounts.forEach((account) => {
                
                account.docs.forEach((doc) => { toServer.push(["CreateBankPayment", doc, account["РасчСчет"]]); });
            });
            
            let change = this.$refs.state.change, th = this;
            
            function accepted(data)
            {
                change("show");
                console.log("accepted");
                console.log(data);
                
                let i = 0;
                
                th.accounts.forEach((account) => {
                
                    let docs = [];
                    
                    account.docs.forEach((doc) => {
                        
                        doc.Doc = data[i].Doc;
                        
                        if(data[i].Recognized) docs.push(doc);
                        else
                        {
                            doc.account = account["РасчСчет"];
                            th.unrecognized.push(doc);
                        }
                        i++;
                        //toServer.push(["CreateBankPayment", doc, account["РасчСчет"]]);
                    });
                    
                    Vue.set(account, "docs", docs);
                });
                
                th.submitted = true;
            }
            
            function rejected(message)
            {
                change("error", message);
            }
            
            change("changing", "Запись платежей");
            
            this.SEND_DATA({
                query: {
                    func: "CreateBankPayment",
                    docs: toServer
                },
                accepted: accepted,
                rejected: rejected
            });
        }
    }
}
</script>