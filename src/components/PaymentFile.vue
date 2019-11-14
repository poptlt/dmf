<template>
<State ref="state">
    
    <input v-if="!submitted"
           type="file"
           v-on:input="changeFile"
           ref="file"
           class="form-control"/>
    
    <template v-if="accounts.length">
        
    <center v-if="!submitted" class="m-1">
        <button @click="sendFile" class="btn btn-primary">Записать</button>
    </center>

        
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
                
                <button @click="flip(accountInfo, i)"
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
            
            <div v-for="(doc, j) in account.docs"
                 
                 :style="{'background-color': (doc.recognized === undefined) ? 'white' : (doc.recognized ? '#ccffcc' : '#ffcccc')}"
                 
                 class="border-top">
                
                <div class="d-flex">
                    <div @click="doc.Doc ? showDoc(doc.Doc) : false"
                         class="d-flex flex-wrap p-2">
                        
                        <div class="flex-grow-0 p-2">
                            {{ (doc['ПолучательРасчСчет'] == account['РасчСчет']) ? '+' : '-' }}
                        </div>
                        <div v-if="doc['Дата']" class="flex-grow-0 p-2">
                            {{ doc['Дата'] }}
                        </div>
                        <div v-if="doc['Номер']" class="flex-grow-0 p-2">
                            № {{ doc['Номер'] }}
                        </div>
                        <div v-if="doc['Сумма']" class="flex-grow-0 p-2">
                            {{ doc['Сумма'] }} руб.
                        </div>
                        <div v-if="doc['НазначениеПлатежа']" class="flex-grow-0 p-2">
                            {{ doc['НазначениеПлатежа'] }}
                        </div>
                        
                    </div>
                    <button @click="flip(docInfo[i], j)"
                            class="flex-grow-0 m-1 btn btn-link btn-sm">
                        <font-awesome-icon :icon="docInfo[i][j] ? 'chevron-up' : 'chevron-down'"/>
                    </button>
                </div>
                <table v-show="docInfo[i][j]" class="table">
                    <template v-for="(val, prop) in doc">
                    <tr v-if="prop != 'ПорядковыйНомер' && prop != 'Doc' && prop != 'recognized'">
                        <td>{{ prop }}</td><td>{{ val }}</td>
                    </tr>
                    </template>
                </table>
            
            </div>
            
        </Tab>
    </div>
    </template>

</State>
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
            docInfo: [],
            accordionID: "id"+(""+Math.random()).substring(2),
            submitted: false,
        };
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        flip(arr, i)
        {
            Vue.set(arr, i, arr[i] ? false : true);
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
            this.docInfo = [];
            
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
                    
                    this.docInfo.push([]);
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
                
                let i = 0;
                
                th.accounts.forEach((account) => {
                                    
                    account.docs.forEach((doc) => {
                        
                        doc.Doc = data[i].Doc;
                        doc.recognized = data[i].Recognized;
                        i++;
                    });
                    
                    function comp(doc1, doc2)
                    {
                        if(doc1.recognized == doc2.recognized) return 0;
                        else if(!doc1.recognized) return -1;
                        else return 1;
                    }
                    
                    account.docs.sort(comp);
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