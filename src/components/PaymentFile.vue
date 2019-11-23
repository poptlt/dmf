<template>
<State ref="state">
    
    <input v-if="!submitted"
           type="file"
           v-on:input="changeFile"
           ref="file"
           class="form-control"/>
    
    <template v-if="accounts.length">
        
    <center v-if="!submitted" class="m-1">
        <button @click="sendDoc(0, 0)" class="btn btn-primary">Записать</button>
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
            
            <template v-if="account.BABalance">
                
                <div v-if="account.BABalance.same === false" class="alert alert-danger">
                    Внимание, не совпал начальный остаток!
                </div>
                <div v-if="account.BABalance.error" class="alert alert-danger">
                    Не удалось узнать начальный остаток, {{ account.BABalance.error }}
                </div>
                
            </template>
            
            <div class="d-flex align-items-center">
                
                <div class="text-center font-weight-bold">Информация по счету</div>
                
                <button @click="flip(accountInfo, i)"
                        class="flex-grow-0 m-1 btn btn-link btn-sm">
                    <font-awesome-icon :icon="accountInfo[i] ? 'chevron-up' : 'chevron-down'"/>
                </button>
            </div>
            <table v-show="accountInfo[i]" class="table">
                <template v-for="(val, key) in account">
                    <tr v-if="key != 'docs' && key != 'BABalance'">
                        
                        <td>{{ key }}</td>
                        
                        <td v-if="key == 'НачальныйОстаток' && account.BABalance">
                            <span :class="{'text-success': (account.BABalance.same === true),
                                          'text-danger': (account.BABalance.same === false)}">
                                {{ val }}
                            </span>
                            <span v-if="account.BABalance.error" class="text-danger">
                                {{ account.BABalance.error }}
                            </span>
                        </td>
                        <td v-else>{{ val }}</td>
                    </tr>
                </template>
            </table>
            
            <div class="text-center font-weight-bold m-2">Платежи</div>
            
            <div v-for="(doc, j) in account.docs"
                 
                 :style="{'background-color': (doc.recognized === undefined) ? 'white' : (doc.recognized ? '#ccffcc' : '#ffcccc')}"
                 
                 class="border-top">
                
                <div class="d-flex">
                    <div @click="doc.Doc ? (showDoc(doc.Doc), account.docs.splice(j, 1)) : false"
                         class="d-flex flex-wrap p-2">
                        
                        <div v-if="doc.error"
                             class="flex-grow-0 p-2 text-danger">
                            <font-awesome-icon icon="exclamation-triangle"/>
                            {{ doc.error }}
                        </div>
                        
                        <div class="flex-grow-0 p-2">
                            <font-awesome-icon :icon="(doc['ПолучательРасчСчет'] == account['РасчСчет']) ? 'plus' : 'minus'"/>
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
        ...mapActions(["SEND_DATA", "SERVER_REQUEST2"]),
        flip(arr, i)
        {
            Vue.set(arr, i, arr[i] ? false : true);
        },
        showDoc({DocID, Name, Object})
        {
            this.addPanel("BankPayment", Name, {DocumentID: DocID, FirmID: Object.FirmID});
        },
        docComp(doc1, doc2)
        {
            function f(date)
            {
                return date.substr(6, 4)+date.substr(3, 2)+date.substr(0, 2);
            }
            
            if(doc1.recognized == doc2.recognized)
            {
                let x = f(doc1['Дата']), y = f(doc2['Дата']);
                
                if(x==y)
                {
                    let keys = ["ТипДокумента", "ПлательщикСчет", "Номер"];
                    
                    for(let i=0; i<keys.length; i++)
                    {
                        let key = keys[i];
                        if(doc1[key] < doc2[key]) return -1;
                        if(doc1[key] > doc2[key]) return 1;
                    }
                    
                    return 0;
                }
                else if(x<y) return -1;
                else return 1;
            }
            else if(!doc1.recognized) return -1;
            else return 1;
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
                
                account.docs.sort(this.docComp);
                
                account.docs[0]["ПорядковыйНомер"] = 0;
                
                for(let i=1; i<account.docs.length; i++)
                {
                    if(this.docComp(account.docs[i-1], account.docs[i]) == 0)
                    {
                        account.docs[i]["ПорядковыйНомер"] = account.docs[i-1]["ПорядковыйНомер"] + 1;
                    }
                    else account.docs[i]["ПорядковыйНомер"] = 0;
                }
            });
            
            let change = this.$refs.state.change;
            
            if(this.accounts.length)
            {
                let queries = [];
                
                this.accounts.forEach((account) => {
                    
                    queries.push(["GetBABeginBalance", account["РасчСчет"]]);
                    
                    let date = account["ДатаНачала"];
                    
                    date = new Date(date.substr(6, 4), date.substr(3, 2)-1, date.substr(0, 2));
                    
                    date = this.dateForServer(date, "month");
                    
                    queries.push(["GetBABalance", account["РасчСчет"], date]);
                });
                
                let th = this;
                
                function ready(data)
                {                    
                    for(let i=0; i<th.accounts.length; i++)
                    {
                        let add = {};
                        
                        if(data[i*2])
                        {
                            if(data[i*2].DMF_ERROR) add.error = data[i*2].message;
                            else
                            {
                                if(data[i*2+1].DMF_ERROR) add.error = data[i*2+1].message;
                                else
                                {
                                    if(data[i*2+1] == th.accounts[i]["НачальныйОстаток"]) add.same = true;
                                    else add.same = false;
                                }
                            }
                        }
                                                
                        Vue.set(th.accounts[i], "BABalance", add);
                    }
                    
                    change("show");
                }
                
                this.SERVER_REQUEST2({
                    toServer: ["ExecFunctions", queries],
                    accepted: ready,
                });
            }
            else change("show");
        },
        sendDoc(accNum, docNum)
        {
            if(this.accounts[accNum].docs.length == docNum) accNum++, docNum=0;
            
            let change = this.$refs.state.change, th = this;
            
            if(accNum == this.accounts.length)
            {
                this.accounts.forEach((account) => {
                    account.docs.sort(this.docComp);
                });
                
                this.submitted = true;
                
                change("show");
            }
            else
            {
                function accepted(data)
                {
                    let doc = th.accounts[accNum].docs[docNum];
                    
                    doc.Doc = data.Doc;
                    doc.recognized = data.Recognized;
                    
                    th.sendDoc(accNum, docNum+1);
                }
                
                function rejected(message)
                {
                    let doc = th.accounts[accNum].docs[docNum];
                    
                    doc.error = message;
                    
                    th.sendDoc(accNum, docNum+1);
                }
                
                change("changing", "Запись платежей");
            
                this.SEND_DATA({
                    query: {
                        func: "CreateBankPayment",
                        document: this.accounts[accNum].docs[docNum],
                        account: this.accounts[accNum]["РасчСчет"]
                    },
                    accepted: accepted,
                    rejected: rejected
                });
                
            }
        }
    }
}
</script>