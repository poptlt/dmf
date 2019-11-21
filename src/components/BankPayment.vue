<template>
<div>
    <center>
        <button v-if="filled"
                @click="save"
                class="btn btn-primary m-2">
            Сохранить
        </button>
    </center>
    
    <table class="table">
        <tr>
            <td>Вид БПД</td>
            <td v-if="PaymentType != 'ПрочиеРасходы'">
                <select v-model="PaymentType" class="form-control">
                    <option value="ПлатежЛС">Платеж ЛС</option>
                    <option value="НераспознанныйПриход">Нераспознанный приход</option>
                    <option value="ПриходОтПС">Приход от ПС</option>
                    <option value="ПрочиеПриходы">Прочие приходы</option>
                </select>
            </td>
            <td v-else>Прочие расходы</td>
        </tr>
        
        <template v-if="PaymentType == 'ПлатежЛС'">
            <tr>
                <td>Лицевой счет</td>
                <td>
                    <template v-if="LS !== undefined">
                        <div v-if="LS === null">Выполняется поиск...</div>
                        <div v-else-if="typeof(LS) == 'object'">{{ LS.Name }}</div>
                        <div v-else class="alert alert-danger p-1 m-0">{{ LS }}</div>
                    </template>

                    <button @click="findLS('number')" class="btn btn-sm btn-primary m-1">Поиск по номеру</button>
                    <button @click="findLS('adress')" class="btn btn-sm btn-primary m-1">Поиск по адресу</button>

                </td>
            </tr>
            <tr>
                <td><font-awesome-icon icon="search"/></td>
                <td>
                    <input type="text"
                           @input="LSsearch"
                           v-model="adress"
                           class="form-control"/>
                    
                    <div v-if="searchMessage">{{ searchMessage }}</div>
                    
                    <div v-else style="max-height: 300px; overflow: auto">
                        <div v-for="item in LSList"
                             @click="LSselect(item)"
                             class="p-2 border-top">
                            {{ item.Name }}
                        </div>
                    </div>
                </td>
            </tr>
            <tr><td>Плательщик</td><td>{{ payer }}</td></tr>
        </template>

        <tr v-if="PaymentType == 'ПриходОтПС'">
            <td>Договор</td>
            <td>
                <select v-model="accord" class="form-control">
                    <option v-for="item in accords" :value="item.PSAccordID">
                        {{ item.PSAccordName }}
                    </option>
                </select>
            </td>
        </tr>

        <tr><td>Назначение платежа</td><td>{{ document.Comment }}</td></tr>

        <tr><td colspan="2">
            {{ dateForClient(document.Date, 'day') }} 
            {{ document.Summ }} руб. 
            {{ document.TypeFromBank }} 
            № {{ document.Number }}
        </td></tr>

        <tr v-if="document.PayerAccount">
            <td>РС плательщика</td><td>{{ document.PayerAccount }}</td>
        </tr>
        
        <tr v-if="document.ReceiverAccount">
            <td>РС получателя</td><td>{{ document.ReceiverAccount }}</td>
        </tr>
        
                
    </table>

    
    <div class="px-2 mt-2">
        Реквизиты из банковской выгрузки
        <button @click="showBankFile = showBankFile ? false : true"
                class="btn btn-link btn-sm">
            <font-awesome-icon :icon="showBankFile ? 'chevron-up' : 'chevron-down'"/>
        </button>
    </div>
    <table v-show="showBankFile" class="table">
        <tr v-for="item in document.BankFile">
            <td>{{ item.Key }}</td>
            <td>{{ item.Value }}</td>
        </tr>
    </table>
    
</div>
</template>

<script>
    
import { mapActions } from 'vuex';
    
export default {
    props: ["FirmID", "DocumentID", "document", "accords"],
    data: function()
    {        
        let data = {
            
            PaymentType: this.document.PaymentType,
            LS: this.document.LS ? this.document.LS : undefined,
            
            showBankFile: false,
            
            accord: this.document.PSAccordID ? this.document.PSAccordID : this.accords[0].PSAccordID,
            
            adress: "",
            LSList: [],
            searchMessage: "Ничего не найдено",
            searchTimestamp: undefined,
        };
        
        this.document.BankFile.forEach((item) => {
            
            if(item.Key == "Плательщик")
            {
                data.payer = item.Value;
                
                while(data.payer.includes("//"))
                {
                    data.payer = data.payer.replace("//", " ");
                }
            }
        });
        
        return data;
    },
    computed:
    {
        filled()
        {
            if(this.PaymentType == "ПлатежЛС" && (this.LS === null || typeof(this.LS) != "object"))
            {
                return false;
            }
            else return true;
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA", "FIND_LS"]),
        findLS(type)
        {
            let th = this;
            
            function accepted(data)
            {
                th.LS = data;
            }
            
            function rejected(message)
            {
                th.LS = message;
            }
            
            this.LS = null;
            
            let str = document.getSelection().toString();
            
            if(!str) str = this.document.Comment; 
                        
            this.SEND_DATA({
                query: {
                    func: (type == "number") ? "FindLSNumber" : "FindLSAdress",
                    FirmID: this.FirmID,
                    string: str
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        LSsearch()
        {
            this.searchTimestamp = new Date();
            
            let th = this;
            
            function func(data, timestamp)
            {
                if(timestamp == th.searchTimestamp)
                {
                    if(Array.isArray(data))
                    {
                        th.searchMessage = "", th.LSList = data;
                    }
                    else th.searchMessage = data;
                }
            }
            
            this.FIND_LS({str: this.adress, func: func, timestamp: this.searchTimestamp});
        },
        LSselect(LS)
        {
            this.LS = LS;
            this.adress = "";
            this.LSList = [];
            this.searchMessage = "Ничего не найдено";
        },
        save()
        {
            let doc = {
                DocID: this.DocumentID,
                PaymentType: this.PaymentType
            };
            
            if(this.PaymentType == "ПлатежЛС") doc.LSID = this.LS.ObjectID;
            
            if(this.PaymentType == "ПриходОтПС") doc.PSAccordID = this.accord;
            
            let change = this.$parent.change;
                        
            function accepted()
            {
                change("done", "Документ изменен");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при изменении документа: " + message);
            }
            
            change("changing", "Изменение документа");
            
            this.SEND_DATA({
                query: {
                    func: "BankPaymentWrite",
                    data: doc,
                    FirmID: this.FirmID
                },
                accepted: accepted,
                rejected: rejected
            });
        }
    }
}
</script>

<style>
    
</style>