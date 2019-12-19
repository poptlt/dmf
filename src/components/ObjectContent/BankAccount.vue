<template>
<div>
    <div v-if="data.Summ" class="p-1">
        Начальный остаток: {{ data.Summ }} руб. на {{ dateForClient(data.Date, 'day') }}
    </div>
    
    <div @click="showAll = showAll ? false : true"
         class="bg-secondary text-white p-2 text-center mt-2">
        ОСВ
    </div>
    
    <div v-show="showAll">
        <div class="d-flex flex-wrap">
            <div class="d-flex">
                <div class="m-1 flex-grow-0" style="width: 20px">с</div>

                <Datepicker v-model="ldate"
                            @selected="ldateChanged"
                            :monday-first="true"
                            :language="ru"
                            :format="dateFormatter"
                            minimum-view="day"
                            :bootstrap-styling="true"
                            class="m-1"
                            style="min-width: 300px"/>
            </div>
            <div class="d-flex">
                <div class="m-1 flex-grow-0" style="width: 20px">по</div>

                <Datepicker v-model="rdate"
                            @selected="rdateChanged"
                            :monday-first="true"
                            :language="ru"
                            :format="dateFormatter"
                            minimum-view="day"
                            :bootstrap-styling="true"
                            class="m-1"
                            style="min-width: 300px"/>
            </div>
        </div>
        
        <State ref="state">

        <center>
            <button @click="getTurnover" class="btn btn-primary m-2">
                Получить
            </button>
        </center>

        <div v-if="typeof(turnover) == 'string'"
             class="alert alert-danger">
            {{ turnover }}
        </div>
        <div v-else-if="turnover">

            <table class="table">
                <tr><td>Начальный остаток</td><td>{{ turnover.BeginSaldo }}</td></tr>

                <tr><td>Всего поступило</td><td>{{ sumTrue }}</td></tr>

                <tr><td>Всего списано</td><td>{{ sumFalse }}</td></tr>

                <tr><td>Конечный остаток</td><td>{{ turnover.EndSaldo }}</td></tr>
            </table>

            <div v-for="item in turnover.Moving"
                 @click="(item.Doc) ? showDoc(item.Doc) : null"
                 class="d-flex flex-wrap p-2 border-top"
                 :style="{'background-color': item.Type ? '#ccffcc' : '#ffcccc'}">

                <div v-if="item.FailPayment" class="flex-grow-0 p-2">
                    <font-awesome-icon class="text-danger" icon="exclamation-triangle"/>
                </div>
                <div class="flex-grow-0 p-2">{{ dateForClient(item.Date, 'day') }}</div>
                <div class="flex-grow-0 p-2">{{ item.Summ }} руб.</div>
                <div class="flex-grow-0 p-2">{{ item.Text }}</div>
            </div>

        </div>

        </State>
    </div>
    
    <div @click="showFailed = showFailed ? false : true"
         class="bg-secondary text-white p-2 text-center mt-2">
        Неопознанные платежи
    </div>
    <template v-if="showFailed">
        
        <template v-if="isData([failed])">
            
            <div v-for="payment in failed"
                 @click="showDoc(payment.Doc)"
                 class="d-flex flex-wrap p-2 border-top">
                
                <div class="flex-grow-0 p-2">
                    {{ payment.Date }}
                </div>
                <div class="flex-grow-0 p-2">
                    № {{ payment.Number }}
                </div>
                <div class="flex-grow-0 p-2">
                    {{ payment.Summ }} руб.
                </div>
                <div class="flex-grow-0 p-2">
                    {{ payment.Text }}
                </div>
                
            </div>
            
        </template>
        <NoData v-else :data="[failed]"/>

    </template>
    
</div>
</template>

<script>
    
import NoData from '../NoData.vue';
    
import State from '../State.vue';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';
    
import { mapActions } from 'vuex';
    
export default {
    components:
    {
        NoData, State, Datepicker
    },
    props: ["ID", "FirmID", "data", "addPanel"],
    data: function()
    {
        return {
        
            ru: ru,
            
            ldate: new Date(),
            rdate: new Date(),
            
            showFailed: false,
            showAll: true,
            
            turnover: undefined,
            sumTrue: 0,
            sumFalse: 0
        };
    },
    computed:
    {
        failed()
        {
            return this.vuexLoad({
                data: {
                    func: "FailPayments",
                    AccountID: this.ID,
                    FirmID: this.FirmID
                }
            }).data;
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        dateFormatter(date)
        {
            return this.dateForClient(date, "day");
        },
        ldateChanged: function(date)
        {
            if(this.rdate < date) this.rdate = date;
        },
        rdateChanged: function(date)
        {
            if(this.ldate > date) this.ldate = date;
        },
        showDoc({DocID, Name, Object})
        {
            this.addPanel("BankPayment", Name, {DocumentID: DocID, FirmID: Object.FirmID});
        },
        getTurnover()
        {
            let change = this.$refs.state.change, th = this;
            
            function accepted(data)
            {                
                th.sumTrue = 0, th.sumFalse = 0;
                                
                data.Moving.forEach((item) => {
                    
                    if(item.Type) th.sumTrue += item.Summ;
                    else th.sumFalse += item.Summ;
                });
                
                th.sumTrue = th.sumTrue.toFixed(2);
                th.sumFalse = th.sumFalse.toFixed(2);
                
                change("show");
                th.turnover = data;
            }
            
            function rejected(message)
            {
                change("show");
                th.turnover = message;
            }
            
            change("changing", "Ожидание ответа");
            
            this.SEND_DATA({
                query: {
                    func: "BankAccountTurnover",
                    AccountID: this.ID,
                    ldate: this.dateForServer(this.ldate, "day"),
                    rdate: this.dateForServer(this.rdate, "day")
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        
    }
}
</script>

<style>

</style>
