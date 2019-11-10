<template>
<div>
    <table class="table">
        <tr v-for="prop in editable">
            <td>{{ prop.label }}</td>

            <template v-if="typeof(prop.type) == 'string'">

                <td v-if="prop.type == 'bool'">
                    <div class="d-flex align-items-center">
                        
                        <div class="text-right">начисление</div>
                        <input type="radio" :value="true" v-model="prop.value" style="height: 15px; width: 15px"/>

                        <div class="text-right">оплата</div>
                        <input type="radio" :value="false" v-model="prop.value" style="height: 15px; width: 15px"/>
                    </div>
                </td>

                <td v-if="prop.type == 'date'">
                    <Datepicker v-model="prop.value"
                                :monday-first="true"
                                :language="ru"
                                :format="dateFormatter"
                                minimum-view="day"
                                :bootstrap-styling="true"/>
                </td>
                
            </template>
            <template v-else>
            
                <td v-if="prop.type.type == 'string'">
                    <input type="text" v-model="prop.value" class="form-control"/>
                </td>

                <td v-if="prop.type.type == 'number'">
                    <input type="number" v-model="prop.value" class="form-control"/>
                </td>
            
            </template>
                        
        </tr>
    </table>
    
    <div class="d-flex justify-content-around">
        <button @click="save"
                class="btn btn-primary flex-grow-0">
            Сохранить
        </button>
        
        <button v-if="document"
                @click="remove"
                class="btn btn-danger flex-grow-0">
            Удалить
        </button>
    </div>
</div>
</template>

<script>

import { mapActions } from 'vuex';
    
import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
export default {
    props: ["FirmID", "ObjectID", "DocumentID", "document", "type"],
    components:
    {
        Datepicker
    },
    data: function()
    {
        let data = {
            ru: ru,
            editable: []
        }
        
        let doc = this.document;
        
        if(this.type == "LSBalanceChange")
        {
            data.editable = [
                {
                    key: "Date",
                    label: "Дата",
                    type: "date",
                    value: doc ? new Date(Date.parse(doc.Date)) : new Date(),
                },
                {
                    key: "MovingType",
                    label: "",
                    type: "bool",
                    value: doc ? doc.MovingType : true,
                },
                {
                    key: "Summ",
                    label: "Сумма",
                    type: {type: "number", noNegative: false, digits: 10, digitsAfterPoint: 2},
                    value: doc ? doc.Summ : "",
                },
                {
                    key: "Comment",
                    label: "Комментарий",
                    type: {type: "string", length: 100},
                    value: doc ? doc.Comment : "",
                }
            ];
        }
        
        return data;
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        dateFormatter(date)
        {
            return this.dateForClient(date, "day");
        },
        save()
        {
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
            
            let toServer = {
                DocID: this.DocumentID,
                LS: this.ObjectID,
            };
            
            this.editable.forEach((prop) => {
                
                let val = prop.value;
                
                if(prop.type == "date") val = this.dateForServer(val, "day");
                
                toServer[prop.key] = val;
            });
            
            this.SEND_DATA({
                query: {
                    func: "LSBalanceChangeWrite",
                    DocumentID: this.DocumentID,
                    FirmID: this.FirmID,
                    LSID: this.ObjectID,
                    data: toServer
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        remove()
        {
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Документ удален");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при удалении документа: " + message);
            }
            
            change("changing", "Удаление документа");
            
            this.SEND_DATA({
                query: {
                    func: "LSBalanceChangeDelete",
                    DocumentID: this.DocumentID,
                    FirmID: this.FirmID,
                    LSID: this.ObjectID,
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